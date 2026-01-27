import { useState, useEffect } from "react";
import axios from "axios";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Header from "./components/Header";
import AppTheme from "../shared-theme/AppTheme";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";


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
    axios.get("http://localhost:8080/velocity-greenhopper")
      .then((res) => setVelocityData(processVelocityData(res.data)))
      .catch((err) => console.error(err));

    axios.get("http://localhost:8080/list-issues")
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
          setChartData(Object.keys(stats).map((key) => ({
            name: key,
            value: stats[key].count,
            totalSp: stats[key].sp,
          })));
          data.totalSp = calculatedTotalSP;
        }
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });

    axios.get("http://localhost:8080/backlog")
      .then((res) => setBacklogList(res.data))
      .catch((err) => console.error(err));
  }, []);

  const completionRate = dashboardData?.totalSp > 0
    ? Math.round((dashboardData.completedStoryPoints / dashboardData.totalSp) * 100)
    : 0;

  return (
    <AppTheme {...props} >
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", bgcolor: '#f5f7fa', minHeight: '100vh' }}>

        <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
          <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Header />

            {loading || !dashboardData ? (
              <Typography variant="h6">Loading..</Typography>
            ) : (
              // maxWidth=xl yerine lg
              <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Grid container spacing={3}>
 
                  <Grid item xs={12} lg={4} md={4}>
                    <Box sx={{ height: BOX_HEIGHT }}>
                      <Stack direction="column" spacing={1} sx={{ height: '100%' }}>
                        
                        {/* Üst Satır */}
                        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                          {/* Sol Üst */}
                          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <CardContent>
                              <Typography color="textSecondary" variant="caption">Current Sprint</Typography>
                              <Typography variant="h6" fontWeight="bold" title={dashboardData.sprintName}>
                                {dashboardData.sprintName}
                              </Typography>
                            </CardContent>
                          </Card>
                          {/* Sağ Üst */}
                          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <CardContent>
                              <Typography color="textSecondary" variant="caption">Total SP</Typography>
                              <Typography variant="h4" fontWeight="bold">{dashboardData.totalSp}</Typography>
                            </CardContent>
                          </Card>
                        </Stack>

                        {/* Alt Satır */}
                        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                          {/* Sol Alt */}
                          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <CardContent>
                              <Typography color="textSecondary" variant="caption">Amount of Tasks</Typography>
                              <Typography variant="h4" fontWeight="bold">{dashboardData.issueList.length}</Typography>
                            </CardContent>
                          </Card>
                          {/* Sağ Alt */}
                          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <CardContent>
                              <Typography color="textSecondary" variant="caption">Completed SPs</Typography>
                              <Typography variant="h4" color="success.main" fontWeight="bold">
                                {dashboardData.completedStoryPoints}
                                <span style={{ fontSize: '14px', color: '#666', marginLeft: '4px', fontWeight: 'normal' }}>
                                  (%{completionRate})
                                </span>
                              </Typography>
                            </CardContent>
                          </Card>
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>

                   {/* PIE CHART */}
                  <Grid item xs={12} md={4} lg={4}>
                    <Paper sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", height: BOX_HEIGHT, justifyContent: 'center' }}>
                      <Typography variant="h6" gutterBottom>Issue Distribution</Typography>
                      <PieChart width={300} height={250}>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      </PieChart>
                    </Paper>
                  </Grid>

                  {/* VELOCITY CHART */}
                  <Grid item xs={12} md={4} lg={4}>
                    <Paper sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", height: BOX_HEIGHT, justifyContent: 'center' }}>
                      <Typography variant="h6" gutterBottom>Velocity Chart</Typography>
                      <BarChart width={300} height={250} data={velocityData}>
                        <CartesianGrid strokeDasharray="5 5" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Bar dataKey="committed" fill="#8884d8" name="Planned" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" fill="#82ca9d" name="Completed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </Paper>
                  </Grid>

                    {/* SPRINT ISSUE LIST */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, overflow: "hidden" }}>
                        <Typography variant="h6" gutterBottom>
                          Sprint Issue List ({dashboardData.issueList.length})
                        </Typography>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ borderCollapse: "collapse", fontSize: "14px", tableLayout: "fixed" }}>
                            <thead>
                              <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                                <th style={{ padding: "10px", width: "15%" }}>Key</th>
                                <th style={{ padding: "10px", width: "55%" }}>Summary</th>
                                <th style={{ padding: "10px", width: "15%" }}>Assignee</th>
                                <th style={{ padding: "10px", width: "10%" }}>Status</th>
                                <th style={{ padding: "10px", width: "5%" }}>SP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.issueList.map((issue) => (
                                <tr key={issue.key} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                  <td style={{ padding: "10px", color: "#1976d2", fontWeight: "bold" }}>{issue.key}</td>
                                  <td style={{ padding: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{issue.summary}</td>
                                  <td style={{ padding: "10px" }}>{issue.assignee || "-"}</td>
                                  <td style={{ padding: "10px" }}>
                                    <Chip 
                                      label={issue.status} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: issue.status.toLowerCase().includes("done") ? "#e8f5e9" : "#e3f2fd",
                                        color: issue.status.toLowerCase().includes("done") ? "#2e7d32" : "#1565c0",
                                        fontWeight: "bold", fontSize: "12px"
                                      }}
                                    />
                                  </td>
                                  <td style={{ padding: "10px", fontWeight: "bold" }}>{issue.sp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Paper>
                    </Grid>

                  {/* BACKLOG LIST */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, overflow: "hidden" }}>
                      <Typography variant="h6" gutterBottom>
                        Backlog ({backlogList.length})
                      </Typography>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", tableLayout: "fixed" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                              <th style={{ padding: "10px", width: "10%" }}>Key</th>
                              <th style={{ padding: "10px", width: "60%" }}>Summary</th>
                              <th style={{ padding: "10px", width: "30%" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {backlogList.length > 0 ? (
                              backlogList.map((issue) => {
                                const fields = issue.fields || {};
                                return (
                                  <tr key={issue.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "10px", color: "#1976d2", fontWeight: "bold" }}>{issue.key}</td>
                                    <td style={{ padding: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fields.summary}</td>
                                    <td style={{ padding: "10px" }}>
                                      <Chip 
                                        label={fields.status?.name || "To Do"}
                                        size="small"
                                        sx={{ 
                                            bgcolor: fields.status?.name?.toLowerCase().includes("done") ? "#e8f5e9" : "#e3f2fd",
                                            color: fields.status?.name?.toLowerCase().includes("done") ? "#2e7d32" : "#1565c0",
                                            fontWeight: "bold", fontSize: "12px"
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr><td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#999" }}>Backlog boş.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Paper>
                  </Grid>
                </Grid>
              </Container>
            )}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}