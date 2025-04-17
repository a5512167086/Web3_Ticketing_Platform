import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useWallet } from "@/context/WalletContext";
import { useEventContract } from "@/hooks/useEventContract";

interface TicketData {
  ticketId: number;
  eventId: number;
  eventName: string;
  checkedInAt: number;
}

export default function MyTickets() {
  const { account } = useWallet();
  const contract = useEventContract();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketData[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!contract || !account) return;
      setLoading(true);

      try {
        const balance = await contract.balanceOf(account);
        const ticketIds = await Promise.all(
          Array.from({ length: Number(balance) }).map((_, i) =>
            contract.tokenOfOwnerByIndex(account, i)
          )
        );

        const ticketData = await Promise.all(
          ticketIds.map(async (ticketId) => {
            const [eventId, checkedInAt] = await Promise.all([
              contract.ticketToEvent(ticketId),
              contract.getCheckInTimestamp(ticketId),
            ]);
            const eventData = await contract.events(eventId);

            return {
              ticketId: Number(ticketId),
              eventId: Number(eventId),
              eventName: eventData.name,
              checkedInAt: Number(checkedInAt),
            };
          })
        );

        setTickets(ticketData);
      } catch (err) {
        console.error("票券查詢失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [contract, account]);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        🎟️ 我的票券
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : tickets.length === 0 ? (
        <Typography>你尚未擁有任何票券</Typography>
      ) : (
        <Grid container spacing={2}>
          {tickets.map((ticket) => (
            <Grid size={12} key={ticket.ticketId}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{ticket.eventName}</Typography>
                  <Typography>🎫 票券 ID: {ticket.ticketId}</Typography>
                  <Typography>📌 活動 ID: {ticket.eventId}</Typography>
                  <Typography
                    color={ticket.checkedInAt ? "success.main" : "error"}
                  >
                    {ticket.checkedInAt
                      ? `✅ 已驗票：${new Date(
                          ticket.checkedInAt * 1000
                        ).toLocaleString()}`
                      : "⏳ 尚未驗票"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
