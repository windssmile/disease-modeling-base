document.getElementById('sir-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/api/sir', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(res => {
        drawChart(res.days, res.S, res.I, res.R, res.D);
    });
});

function drawChart(days, S, I, R, D) {
    var chartDom = document.getElementById('chart');
    var myChart = echarts.init(chartDom);
    var option = {
        title: { text: 'SIRD模型时序变化图' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['易感者S', '感染者I', '移除者R', '死亡者D'] },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        series: [
            { name: '易感者S', type: 'line', data: S },
            { 
                name: '感染者I', 
                type: 'line', 
                data: I,
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' }
                    ],
                    label: {
                        formatter: function(param) {
                            return '最大值\n' + param.value;
                        }
                    }
                }
            },
            { name: '移除者R', type: 'line', data: R },
            { name: '死亡者D', type: 'line', data: D }
        ]
    };
    myChart.setOption(option);
}