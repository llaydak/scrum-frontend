import { useState, useEffect } from "react";
import DashboardContent from "./DashboardContent";
import axios from "axios";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Header from "./components/Header";
import AppTheme from "../shared-theme/AppTheme";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";



export default function Dashboard(props) {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [velocityData, setVelocityData] = useState([]);
  const [backlogList, setBacklogList] = useState([]);
  const BOX_HEIGHT = 350;


  const processVelocityData = (data) => {
    if (!data || !data.sprints || !data.velocityStatEntries) return [];
    const { sprints, velocityStatEntries } = data;
    const sortedSprints = sprints.sort((a, b) => a.id - b.id);
    const lastSprints = sortedSprints.slice(-5);
    return lastSprints.map((sprint) => {
      const stats = velocityStatEntries[sprint.id];
      return {
        name: sprint.name,
        committed: stats?.estimated?.value || 0,
        completed: stats?.completed?.value || 0,
      };
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, border: "1px solid #ccc", boxShadow: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2">Amount: {data.value}</Typography>
          <Typography variant="body2" color="primary" fontWeight="bold">
            Total: {data.totalSp} SP
          </Typography>
        </Paper>
      );
    }
    return null;
  };
    
  useEffect(() => {
    axios
      .get("http://localhost:8080/velocity-greenhopper")
      .then((res) => setVelocityData(processVelocityData(res.data)))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:8080/list-issues")
      .then((res) => {
        const data = res.data;
        let calculatedTotalSP = 0;
        if (data.issueList) {
          const stats = {};
          data.issueList.forEach((issue) => {
            const status = issue.status || "Unknown";
            if (!stats[status]) stats[status] = { count: 0, sp: 0 };
            stats[status].count += 1;
            stats[status].sp += issue.sp || 0;
            calculatedTotalSP += issue.sp || 0;
          });
          setChartData(
            Object.keys(stats).map((key) => ({
              name: key,
              value: stats[key].count,
              totalSp: stats[key].sp,
            })),
          );
          data.totalSp = calculatedTotalSP;
        }
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    axios
      .get("http://localhost:8080/backlog")
      .then((res) => setBacklogList(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
        <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            <Header />
            {loading || !dashboardData ? (
              <Typography variant="h6">Loading..</Typography>
            ) : (
              <DashboardContent
                dashboardData={dashboardData}
                chartData={chartData}
                velocityData={velocityData}
                backlogList={backlogList}
                BOX_HEIGHT={BOX_HEIGHT}
                CustomTooltip={CustomTooltip}
              />
            )}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
