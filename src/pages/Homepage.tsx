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
} from "@mui/material";
import { useEventContract } from "@/hooks/useEventContract";
import { useToast } from "@/context/ToastProvider";

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

  // 建立活動 Dialog 狀態
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
      console.error("載入活動失敗", err);
      toast.error("載入活動失敗！");
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
      toast.success("✅ 購票成功！");
      await fetchEvents();
    } catch (err: any) {
      console.error("購票失敗", err);
      const rawMsg = err?.message || "";
      if (rawMsg.includes("insufficient funds")) {
        toast.error("❌ 錢包餘額不足，請先領取 Sepolia 測試幣");
      } else {
        toast.error(`❌ 購票失敗: ${rawMsg}`);
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
      toast.success("✅ 活動建立成功！");
      setDialogOpen(false);
      setNewEventName("");
      setNewTicketPrice("");
      setNewTicketCount("");
      await fetchEvents();
    } catch (err: any) {
      console.error("建立活動失敗", err);
      toast.error("❌ 活動建立失敗：" + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">🎫 所有活動清單</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          建立活動
        </Button>
      </Box>

      {/* 建立活動 Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>建立新活動</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="活動名稱"
            fullWidth
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="票價（ETH）"
            fullWidth
            type="number"
            value={newTicketPrice}
            onChange={(e) => setNewTicketPrice(e.target.value)}
          />
          <TextField
            margin="dense"
            label="票數"
            fullWidth
            type="number"
            value={newTicketCount}
            onChange={(e) => setNewTicketCount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={creating}>
            取消
          </Button>
          <Button
            onClick={handleCreateEvent}
            disabled={
              creating || !newEventName || !newTicketPrice || !newTicketCount
            }
          >
            {creating ? "建立中..." : "建立"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 活動列表 */}
      {loading ? (
        <CircularProgress />
      ) : events.length === 0 ? (
        <Typography>目前尚無活動</Typography>
      ) : (
        <Grid container spacing={2}>
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
              >
                <Typography variant="h6">{event.name}</Typography>
                <Typography>票價: {event.ticketPrice}</Typography>
                <Typography>
                  剩餘票數: {event.totalTickets - event.ticketsSold} /{" "}
                  {event.totalTickets}
                </Typography>
                <Typography>
                  狀態: {event.active ? "開放購票" : "停止購票"}
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
                    {buyingId === event.eventId ? "購買中..." : "購買票券"}
                  </Button>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
