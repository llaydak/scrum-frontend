import { useState, useEffect } from "react";
import axios from "axios";

import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header"
import AppTheme from "../shared-theme/AppTheme";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

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

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const processVelocityData = (data) => {
    if (!data || !data.sprints || !data.velocityStatEntries) return [];

    const { sprints, velocityStatEntries } = data;
    const sortedSprints = sprints.sort((a, b) => a.id - b.id);
    const lastSprints = sortedSprints.slice(-3);
    const targetSprints = lastSprints;
    const chartData = targetSprints.map((sprint) => {
      const stats = velocityStatEntries[sprint.id];
      const committed = stats?.estimated?.value || 0;
      const completed = stats?.completed?.value || 0;

      return {
        name: sprint.name,
        committed: committed,
        completed: completed,
      };
    });

    return chartData;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Bizim gönderdiğimiz {name, value, totalSp} objesi
      return (
        <Paper sx={{ p: 1.5, border: "1px solid #ccc", boxShadow: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2">Adet: {data.value}</Typography>
          <Typography variant="body2" color="primary" fontWeight="bold">
            Toplam Efor: {data.totalSp} SP
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [velocityData, setVelocityData] = useState([]);
  const [backlogList, setBacklogList] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/velocity-greenhopper")
      .then((response) => {
        const processedData = processVelocityData(response.data);
        setVelocityData(processedData);
      })
      .catch((error) => {
        console.error("Velocity verisi alınamadı:", error);
      })
    axios
      .get("http://localhost:8080/list-issues")
      .then((response) => {
        const data = response.data;
        let calculatedTotalSP = 0;
        setDashboardData(data);

        if (data.issueList) {
          const stats = {};

          data.issueList.forEach((issue) => {
            const status = issue.status || "Unknown";
            if (!stats[status]) {
              stats[status] = { count: 0, sp: 0 };
            }
            stats[status].count += 1;
            stats[status].sp += issue.sp || 0;
            calculatedTotalSP += issue.sp || 0;
          });
          const formattedChartData = Object.keys(stats).map((key) => ({
            name: key,
            value: stats[key].count,
            totalSp: stats[key].sp,
          }));
          setChartData(formattedChartData);
          data.totalSp = calculatedTotalSP;
        }
        setDashboardData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Veri çekilemedi:", error);
        setLoading(false);
      });
      axios.get("http://localhost:8080/backlog")
         .then(res => {
             setBacklogList(res.data);
         })
         .catch(err => console.error("Backlog hatası:", err));
        
    axios
      .get("http://localhost:8080/get-user")
      .then((response) => {
        if (response.data) {
          const userData = response.data;
          setUser({
            name: userData.displayName,
            email: userData.emailAddress,
            avatar: userData.avatarUrls ? userData.avatarUrls["48x48"] : "",
          });
        }
      })
      .catch((error) => console.error("Kullanıcı alınamadı:", error));
  }, []);

  const completionRate =
    dashboardData?.totalSp > 0
      ? Math.round(
          (dashboardData.completedStoryPoints / dashboardData.totalSp) * 100,
        )
      : 0;

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <AppNavbar />

        {/* ANA İÇERİK ALANI */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {loading || !dashboardData ? (
              <Typography variant="h6">Veriler Yükleniyor...</Typography>
            ) : (
              <Box
                sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}
              >
                {/* 1. KPI KARTLARI */}
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Sprint
                        </Typography>
                        <Typography variant="h5" component="div">
                          {dashboardData.sprintName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {dashboardData.boardName}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Toplam Task Sayısı
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData.issueList.length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Toplam SP
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData.totalSp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Tamamlanan SP
                        </Typography>
                        <Typography
                          variant="h4"
                          color="success.main"
                          fontWeight="bold"
                        >
                          {dashboardData.completedStoryPoints}
                          <span
                            style={{
                              fontSize: "16px",
                              color: "#666",
                              fontWeight: "normal",
                            }}
                          >
                            {" "}
                            (%{completionRate})
                          </span>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* 2. GRAFİK VE TABLO */}
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "350px",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Velocity Chart
                      </Typography>
                      <BarChart width={300} height={250} data={velocityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="committed"
                          fill="#8884d8"
                          name="Planlanan"
                        />
                        <Bar dataKey="completed" fill="#82ca9d" name="Biten" />
                      </BarChart>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2,
                        height: "350px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Issue Status Distribution
                      </Typography>
                      <PieChart width={300} height={250}>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ["#0088FE", "#00C49F", "#FFBB28"][index % 3]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </Paper>
                  </Grid>

                  {/* SAĞ: DETAY TABLOSU */}
                  <Grid item xs={12} md={12}>
                    <Paper sx={{ p: 2, height: "100%", overflow: "hidden" }}>
                      <Typography variant="h6" gutterBottom>
                        Sprint Issue List
                      </Typography>
                      <div style={{ overflowX: "auto" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "14px",
                            tableLayout: "fixed",
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                borderBottom: "2px solid #eee",
                                textAlign: "left",
                              }}
                            >
                              <th style={{ padding: "10px",width: "15%" }}>Key</th>
                              <th style={{ padding: "10px", width: "55%" }}>Summary</th>
                              <th style={{ padding: "10px", width: "15%" }}>Assignee</th>
                              <th style={{ padding: "10px", width: "10%" }}>Status</th>
                              <th style={{ padding: "10px", width: "5%" }}>SP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.issueList.map((issue) => (
                              <tr
                                key={issue.key}
                                style={{ borderBottom: "1px solid #f0f0f0" }}
                              >
                                <td
                                  style={{
                                    padding: "10px",
                                    color: "#1976d2",
                                    fontWeight: "bold",

                                  }}
                                >
                                  {issue.key}
                                </td>
                                <td style={{ padding: "10px" }}>
                                  {issue.summary}
                                </td>
                                <td style={{ padding: "10px"}}>
                                  {issue.assignee || "-"}
                                </td>
                                <td style={{ padding: "10px" }}>
                                  <span
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      backgroundColor: issue.status
                                        .toLowerCase()
                                        .includes("done")
                                        ? "#e8f5e9"
                                        : "#e3f2fd",
                                      color: issue.status
                                        .toLowerCase()
                                        .includes("done")
                                        ? "#2e7d32"
                                        : "#1565c0",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {issue.status}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "10px",
                                    fontWeight: "bold",

                                  }}
                                >
                                  {issue.sp}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Paper>
                  </Grid>
                  
                   <Grid item xs={12} md={12} sx={{ mt: 4 }}>
                    <Paper sx={{ p: 2, height: "100%", overflow: "hidden" }}>
                      <Typography variant="h6" gutterBottom>
                        Backlog ({backlogList.length})
                      </Typography>
                      
                      <div style={{ overflowX: "auto" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "14px",
                            tableLayout: "fixed",
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                borderBottom: "2px solid #eee",
                                textAlign: "left",
                              }}
                            >
                    
                              <th style={{ padding: "10px", width: "20%" }}>Key</th>
                              <th style={{ padding: "10px", width: "60%" }}>Summary</th>
                              <th style={{ padding: "10px", width: "20%" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {backlogList.length > 0 ? (
                              backlogList.map((issue) => {
                                const fields = issue.fields || {};
                                
                                return (
                                  <tr
                                    key={issue.id}
                                    style={{ borderBottom: "1px solid #f0f0f0" }}
                                  >
                                    <td
                                      style={{
                                        padding: "10px",
                                        color: "#1976d2",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {issue.key}
                                    </td>

                                    <td style={{ padding: "10px" }}>
                                      {fields.summary}
                                    </td>

                                    <td style={{ padding: "10px" }}>
                                      <span
                                        style={{
                                          padding: "4px 8px",
                                          borderRadius: "4px",
                                          backgroundColor: fields.status?.name
                                            ?.toLowerCase()
                                            .includes("done")
                                            ? "#e8f5e9"
                                            : "#e3f2fd",
                                          color: fields.status?.name
                                            ?.toLowerCase()
                                            .includes("done")
                                            ? "#2e7d32"
                                            : "#1565c0",
                                          fontSize: "12px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {fields.status?.name || "To Do"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                  <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                                      Backlog boş.
                                  </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Paper>
                  </Grid>
                  
              
                </Grid>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
