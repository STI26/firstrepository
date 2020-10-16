Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* Area Chart */
function createLineChart(canvasID, labels, data) {
  const ctx = document.querySelector(`#${canvasID}`);
  const datasets = data.map(x => {
    const color = `rgba(${getRandomInt(250)}, ${getRandomInt(250)}, ${getRandomInt(250)}, 1)`;
    return {
      label: x.name,
      lineTension: 0.3,
      backgroundColor: 'rgba(78, 115, 223, 0.05)',
      borderColor: color,
      pointRadius: 3,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: color,
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: x.info,
    };
  });

  const myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value, index, values) {
              return value;
            }
          },
          gridLines: {
            color: 'rgb(234, 236, 244)',
            zeroLineColor: 'rgb(234, 236, 244)',
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: 'rgb(255,255,255)',
        bodyFontColor: '#858796',
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            let datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': ' + tooltipItem.yLabel;
          }
        }
      }
    }
  });
  return myLineChart;
}
/* Pie Chart */
function createPieChart(canvasID, labels, data) {
  const ctx = document.querySelector(`#${canvasID}`);
  const hoverBgColors = data.map(i => `rgba(${getRandomInt(250)}, ${getRandomInt(250)}, ${getRandomInt(250)}, 0.6)`);
  const bgColors = hoverBgColors.map(i => i.replace('0.6', '1'));
  const datasets = {
    data: data,
    backgroundColor: bgColors,
    hoverBackgroundColor: hoverBgColors,
    hoverBorderColor: "rgba(234, 236, 244, 1)",
  };
  const myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [datasets],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: 'rgb(255,255,255)',
        bodyFontColor: '#858796',
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
    },
  });
  return myPieChart;
}
function setDateLabel(dt, kind) {
  d = new Date(dt);
  d.setTime(d.getTime() + (-d.getTimezoneOffset() * 60000));
  const date = (d.getDate() < 10 ? `0${d.getDate()}` : d.getDate());
  const month = (d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1);
  const obj = {
    year: d.getFullYear(),
    month: `${month}.${d.getFullYear()}`,
    day: `${date}.${month}.${d.getFullYear()}`,
  };
  return obj[kind];
}
/* Render Charts */
function renderCharts() {
  // const labels0 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // const data0 = [[5000, 10000, 5000, 15000, 10000, 20000, 15000, 25000, 20000, 30000, 25000, 40000],
  //               [4000, 3000, 10000, 5000, 15000, 2000, 15000, 20000, 35000, 40000, 35000, 45000]];
  // const chartTonersLog = createLineChart('toners-log', labels0, data0);
  // const labels1 = ["Direct", "Referral", "Social", "blabla", "hi"];
  // const data1 = [[55, 30, 15], [35, 15, 53, 8, 14]];
  // const chartRepairsStats = createPieChart('repairs-stats', labels1, data1);
  // const chartTonersStats = createPieChart('toners-stats', labels1, data1);
  const kind = 'month';
  const url = document.querySelector('#charts').dataset.fetch;
  const obj = {repaired: true, kind: kind, };
  postData(url, obj, 'getDataForCharts')
    .then(data => {
      console.log(data);
      // Repairs log
      const repairsLogLabel = data.repairsIn.log.map(i => setDateLabel(i.group, kind));
      const repairsLogIn = {info: data.repairsIn.log.map(i => i.count), name: 'Принято в ремонт'};
      const repairsLogOut = {info: data.repairsOut.log.map(i => i.count), name: 'Выдано из ремонта'};
      const repairsLogData = [repairsLogIn, repairsLogOut];
      const chartRepairsLog = createLineChart('repairs-log', repairsLogLabel, repairsLogData);
      // Repairs stats
      const repairsStatsLabelIn = data.repairsIn.stats.map(i => i.equipment__type__name);
      const repairsStatsIn = data.repairsIn.stats.map(i => i.count);
      // TODO: add chart for out
      const repairsStatsLabelOut = data.repairsOut.stats.map(i => i.equipment__type__name);
      const repairsStatsOut = data.repairsOut.stats.map(i => i.count);
      const chartRepairsStats = createPieChart('repairs-stats', repairsStatsLabelIn, repairsStatsIn);
    })
    .catch(error => {
      infoBlock('error', error, 5000);
    });
}

docReady(function() {
  renderCharts();
});
