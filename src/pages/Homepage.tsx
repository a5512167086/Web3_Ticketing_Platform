// pages/Homepage.tsx
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router";

export default function Homepage() {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/events");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      mt={8}
    >
      <Typography variant="h2" fontWeight={700} gutterBottom>
        Welcome to EventPass
      </Typography>
      <Typography variant="h6" maxWidth="600px" mb={4}>
        Your Web3 ticketing solution for hosting, purchasing, and verifying
        event tickets on-chain.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="contained" size="large" onClick={handleExplore}>
          Explore Events
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            })
          }
        >
          Learn More
        </Button>
      </Stack>

      <Box mt={10} maxWidth="800px">
        <Typography variant="h5" gutterBottom>
          What is EventPass?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          EventPass leverages blockchain technology to provide verifiable and
          transferable NFT-based tickets. From ticket sales to on-chain
          check-ins, EventPass ensures secure and transparent event experiences.
        </Typography>
      </Box>
    </Box>
  );
}
