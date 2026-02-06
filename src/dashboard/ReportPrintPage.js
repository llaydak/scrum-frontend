import { useEffect, useState } from "react";
import axios from "axios";
import DashboardContent from "./DashboardContent";

export default function ReportPrintPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [backlogList, setBacklogList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [velocityRes, issuesRes, backlogRes] = await Promise.all([
          axios.get("http://localhost:8080/velocity-greenhopper"),
          axios.get("http://localhost:8080/list-issues"),
          axios.get("http://localhost:8080/backlog"),
        ]);

        if (cancelled) return;

        setVelocityData(processVelocityData(velocityRes.data));
        setBacklogList(backlogRes.data);

        const data = issuesRes.data;
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
            }))
          );

          data.totalSp = calculatedTotalSP;
        }

        setDashboardData(data);
      } catch (e) {
        console.error("ReportPrintPage fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);


  useEffect(() => {
   document.documentElement.removeAttribute("data-report-ready");

  const chartsReady =
    (chartData?.length ?? 0) > 0 &&
    (velocityData?.length ?? 0) > 0;

  const issuesReady =
    (dashboardData?.issueList?.length ?? 0) >= 0; 
  // >= 0 çünkü sprint boş da olabilir, ama data gelmiş olur

  const backlogReady = Array.isArray(backlogList);

  if (
    !loading &&
    dashboardData &&
    chartsReady &&
    issuesReady &&
    backlogReady
  ) {
    document.documentElement.setAttribute("data-report-ready", "true");
  }
}, [loading, dashboardData, chartData, velocityData, backlogList]);

if (loading || !dashboardData) {
  return <div style={{ padding: 24 }}>Preparing report…</div>;
}

  return (
    <DashboardContent
      dashboardData={dashboardData}
      chartData={chartData}
      velocityData={velocityData}
      backlogList={backlogList}
    />
  );
}
