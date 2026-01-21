import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';
import './App.css';
import axios from 'axios';
import { tab } from '@testing-library/user-event/dist/tab';

function App() {
  
  const [tableData, setTableData] =useState(null);
  useEffect(() => {
    axios.get("http://localhost:8080/list-issues")
    .then(response => {
      console.log(response)
      setTableData(response.data)
    })
    .catch(error => console.log(error));
  },[]); //sadece sayfa ilk açıldığında olması için parantez koyduk.

  if(!tableData) return <div>Yükleniyor..</div>
  const statusCounts = {};
  tableData.issueList.forEach(issue => {
    const statusName = issue.status;
    statusCounts[statusName] = (statusCounts[statusName] || 0) +1;
  });

  const chartData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));


  return (
    <div className="App" style={{ padding: '20px', gap: '50px'}}>
      <div style={{ borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>Scrum Dashboard</h1>
      <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
       <div style={{ flex: 1 }}> 
        <h3>Sprint Durumu</h3>
        <PieChart width={400} height={400}>
              <Pie
                data={chartData}    
                cx="50%"           
                cy="50%"             
                outerRadius={100}   
                fill="#8884d8"      
                label               
                dataKey= "value"      
                nameKey="name"       
              >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 4]} />
                  ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
      </div>
    <div>
    <h3>Mevcut Issue Listesi</h3>
    <table border="1" style={{borderCollapse: 'collapse', width: '100%'}}>
     <thead>
      <tr>
        <th>Key</th>
        <th>Özet</th>
        <th>Durum</th>
        <th>Story Point</th>
        <th>İlgili</th>
      </tr>
      </thead>
      <tbody>
      {tableData.issueList.map((issue) =>(
        <tr key={issue.key}>
          <td>{issue.key}</td>
          <td>{issue.summary}</td>
          <td>{issue.status}</td>
          <td>{issue.sp}</td>
          <td>{issue.assignee}</td>
        </tr>
      ))}  
        </tbody> 
      </table>  
      </div>  

    </div>
    </div>
    </div>
  );
}

export default App;
