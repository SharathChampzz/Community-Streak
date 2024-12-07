import React from "react";
import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#1976d2", // Adjust this to your preferred primary color
//     },
//   },
// });

// List of motivational videos
const videos = [
  { id: "sU4Gm8JGAJw", title: "The Power of Consistency by Coach Pain" },
  { id: "GYMazfsYhf4", title: "Consistency is the Key to Achieve Anything" },
  { id: "nCUWBXscy4Y", title: "Eye-Opening Motivational Video on Consistency" },
  { id: "6227uoyAoRg", title: "BE CONSISTENT - Powerful Motivational Video" },
  { id: "aXPhHuieFIE", title: "SIMON SINEK: CONSISTENCY | Best Motivational Speech" },
  { id: "se-nvP3jJhE", title: "The Power of Consistency: Motivational Insights" },
  { id: "svkmwTrIfVY", title: "Consistency Key Of Success | Self Development" },
  { id: "L3kBv0nW58I", title: "5 Golden Rules of Consistency | Life Changing Motivation" },
  { id: "QDqoNEftQ2E", title: "Power of Consistency: Your Path to Success" },
  { id: "WWZPYL1Smy0", title: "CONSISTENCY IS THE KEY TO SUCCESS | Stay Consistent" },
];

function VideoCard({ video, inView }) {
  return (
    <Card
      sx={{
        marginBottom: 4,
        maxWidth: "900px", // Increased width for better appearance
        width: "100%",
        margin: "0 auto", // Centers the video
      }}
    >
      {inView && (
        <CardMedia
          component="iframe"
          src={`https://www.youtube.com/embed/${video.id}`}
          title={video.title}
          allowFullScreen // Enables fullscreen
          sx={{
            height: 400, // Increased height for better viewing
            border: "none",
          }}
        />
      )}
      <CardContent>
        <Typography variant="h6" textAlign="center">
          {video.title}
        </Typography>
      </CardContent>
    </Card>
  );
}

function App() {
  return (
    // <ThemeProvider theme={theme}>
      <Box
        sx={{
          padding: 2,
          maxHeight: "100vh",
          overflowY: "auto",
          backgroundColor: "primary", // Primary theme background color
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          textAlign="center"
          color="secondary" // Contrast color for the title
        >
          Motivational Videos on Consistency
        </Typography>
        <Box sx={{ width: "100%", paddingX: 2 }}>
          {videos.map((video, index) => (
            <LazyVideo key={index} video={video} />
          ))}
        </Box>
      </Box>
    // </ThemeProvider>
  );
}

function LazyVideo({ video }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Box ref={ref}>
      <VideoCard video={video} inView={inView} />
    </Box>
  );
}

export default App;
