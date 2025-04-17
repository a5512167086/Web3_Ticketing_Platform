import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from "@mui/material";
import { useEventContract } from "@/hooks/useEventContract";
import { useToast } from "@/context/ToastProvider";
import { generateTicketImageBlobJS } from "@/utils/index";
import { uploadToPinata } from "@/utils/nftStorage";

interface EventData {
  eventId: number;
  name: string;
  ticketPrice: string;
  ticketPriceRaw: bigint;
  totalTickets: number;
  ticketsSold: number;
  active: boolean;
}

export default function EventList() {
  const contract = useEventContract();
  const toast = useToast();

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newTicketPrice, setNewTicketPrice] = useState("");
  const [newTicketCount, setNewTicketCount] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const eventIdCounter = await contract.eventIdCounter();
      const promises = [];
      for (let id = 1; id < eventIdCounter; id++) {
        promises.push(contract.events(id));
      }
      const rawEvents = await Promise.all(promises);
      const formatted = rawEvents.map((ev: any, index) => ({
        eventId: index + 1,
        name: ev.name,
        ticketPrice: `${formatEther(ev.ticketPrice)} ETH`,
        ticketPriceRaw: ev.ticketPrice,
        totalTickets: Number(ev.totalTickets),
        ticketsSold: Number(ev.ticketsSold),
        active: ev.active,
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Failed to load events", err);
      toast.error("Failed to load events!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchEvents();
  }, [contract]);

  const handleBuy = async (eventId: number, price: bigint) => {
    if (!contract) return;
    try {
      setBuyingId(eventId);
      const tx = await contract.buyTicket(eventId, { value: price });
      await tx.wait();
      toast.success("✅ Ticket purchased successfully!");
      await fetchEvents();
    } catch (err: any) {
      console.error("Ticket purchase failed", err);
      const rawMsg = err?.message || "";
      if (rawMsg.includes("insufficient funds")) {
        toast.error(
          "❌ Insufficient wallet balance. Please claim Sepolia test ETH."
        );
      } else {
        toast.error(`❌ Ticket purchase failed: ${rawMsg}`);
      }
    } finally {
      setBuyingId(null);
    }
  };

  const handleCreateEvent = async () => {
    if (!contract) return;
    try {
      setCreating(true);
      const tx = await contract.createEvent(
        newEventName,
        parseEther(newTicketPrice),
        Number(newTicketCount)
      );
      await tx.wait();
      toast.success("✅ Event created successfully!");

      const newEventId = await contract
        .eventIdCounter()
        .then((v) => Number(v) - 1);

      const blob = await generateTicketImageBlobJS({
        ticketId: 1,
        eventId: newEventId,
        eventName: newEventName,
      });

      const metadataURL = await uploadToPinata({
        file: blob,
        fileName: `event-${newEventId}-ticket.png`,
      });

      toast.success("🖼️ Image uploaded to IPFS!");
      console.log("Pinata URL:", metadataURL);

      setDialogOpen(false);
      setNewEventName("");
      setNewTicketPrice("");
      setNewTicketCount("");
      await fetchEvents();
    } catch (err: any) {
      console.error("Event creation failed", err);
      toast.error("❌ Event creation failed: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box p={4}>
      <Box
        component={Paper}
        elevation={3}
        sx={{ bgcolor: "background.paper", p: 4, borderRadius: 2 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">🎫 All Events</Typography>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Create Event
          </Button>
        </Box>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
        >
          <DialogTitle>Create New Event</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Event Name"
              fullWidth
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Ticket Price (ETH)"
              fullWidth
              type="number"
              value={newTicketPrice}
              onChange={(e) => setNewTicketPrice(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Total Tickets"
              fullWidth
              type="number"
              value={newTicketCount}
              onChange={(e) => setNewTicketCount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={
                creating || !newEventName || !newTicketPrice || !newTicketCount
              }
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {loading ? (
          <CircularProgress />
        ) : events.length === 0 ? (
          <Typography>No events available.</Typography>
        ) : (
          <Grid container spacing={2} mt={2}>
            {events.map((event) => (
              <Grid size={12} key={event.eventId}>
                <Box
                  p={2}
                  border={1}
                  borderColor="grey.300"
                  borderRadius={2}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                  sx={{ bgcolor: "background.default" }}
                >
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography>Price: {event.ticketPrice}</Typography>
                  <Typography>
                    Remaining Tickets: {event.totalTickets - event.ticketsSold}{" "}
                    / {event.totalTickets}
                  </Typography>
                  <Typography>
                    Status: {event.active ? "Open" : "Closed"}
                  </Typography>
                  {event.active && event.ticketsSold < event.totalTickets && (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={buyingId === event.eventId}
                      onClick={() =>
                        handleBuy(event.eventId, event.ticketPriceRaw)
                      }
                    >
                      {buyingId === event.eventId
                        ? "Purchasing..."
                        : "Buy Ticket"}
                    </Button>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
