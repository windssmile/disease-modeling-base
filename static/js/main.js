const form = document.getElementById('sir-form');

// 页面加载时自动填充参数并画图
window.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('sir_params');
    if (saved) {
        const params = JSON.parse(saved);
        for (const key in params) {
            if (form.elements[key]) {
                form.elements[key].value = params[key];
            }
        }
        // 自动请求并画图
        fetch('/api/sir', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(params)
        })
        .then(resp => resp.json())
        .then(res => {
            drawChart(res.days, res.S, res.I, res.R, res.D);
            drawNewCasesChart(res.days.slice(1), res.new_infected, res.new_death);
            drawCumulativeChart(res.days, res.infected_total);
        });
    }
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const N = Number(formData.get('N'));
    const I0 = Number(formData.get('I0'));
    const Im0 = Number(formData.get('Im0'));
    const beta = Number(formData.get('beta'));
    const gamma = Number(formData.get('gamma'));
    const mu = Number(formData.get('mu'));
    const days = Number(formData.get('days'));
    const rho = Number(formData.get('rho') || 0);

    // 保存参数到 localStorage
    localStorage.setItem('sir_params', JSON.stringify({
        N, I0, Im0, beta, gamma, mu, days, rho
    }));

    const data = {
        N, I0, Im0, beta, gamma, mu, days, rho
    };

    fetch('/api/sir', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(res => {
        drawChart(res.days, res.S, res.I, res.R, res.D);
        drawNewCasesChart(res.days.slice(1), res.new_infected, res.new_death);
        drawCumulativeChart(res.days, res.infected_total);
    });
});

function drawChart(days, S, I, R, D) {
    // 计算R0，取当前参数（假设参数已全局可用，否则可传递参数进来）
    const beta = Number(document.querySelector('input[name="beta"]').value);
    const gamma = Number(document.querySelector('input[name="gamma"]').value);
    const mu = Number(document.querySelector('input[name="mu"]').value);
    // 避免分母为0
    let R0 = 0;
    if (gamma + mu > 0) {
        R0 = beta / (gamma + mu);
    }
    // 保留两位小数
    R0 = R0.toFixed(2);

    var chartDom = document.getElementById('chart');
    var myChart = echarts.init(chartDom);
    var option = {
        title: { 
            text: `SIRD模型时序变化图  |  R₀ = ${R0}`,
            left: 'center'
        },
        tooltip: { trigger: 'axis' },
        legend: { 
            data: ['易感者S', '感染者I', '移除者R', '死亡者D'],
            bottom: 10 // 图例距离底部10px
        },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                start: 0,
                end: 100,
                bottom: 40 // slider距离底部40px，刚好在legend上方
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                start: 0,
                end: 100
            }
        ],
        series: [
            { name: '易感者S', type: 'line', data: S, showSymbol: false },
            { 
                name: '感染者I', 
                type: 'line', 
                data: I,
                showSymbol: false,
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
            { name: '移除者R', type: 'line', data: R, showSymbol: false },
            { name: '死亡者D', type: 'line', data: D, showSymbol: false }
        ]
    };
    myChart.setOption(option);
}

function drawNewCasesChart(days, newInfected, newDeath) {
    var chartDom = document.getElementById('chart-newcases');
    if (chartDom) {
        echarts.dispose(chartDom);
        var myChart = echarts.init(chartDom);
        var option = {
            title: { text: '每日新增感染与死亡', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['新增感染', '新增死亡'], bottom: 10 },
            xAxis: { type: 'category', data: days },
            yAxis: { type: 'value' },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    bottom: 40
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }
            ],
            series: [
                { name: '新增感染', type: 'bar', data: newInfected },
                { name: '新增死亡', type: 'bar', data: newDeath }
            ]
        };
        myChart.setOption(option);
    }
}

function drawCumulativeChart(days, infectedTotal) {
    var chartDom = document.getElementById('chart-cumulative');
    if (chartDom) {
        echarts.dispose(chartDom);
        var myChart = echarts.init(chartDom);
        var option = {
            title: { text: '累计感染人次', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['累计感染人次'], bottom: 10 },
            xAxis: { type: 'category', data: days },
            yAxis: { type: 'value' },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    bottom: 40
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }
            ],
            series: [
                { name: '累计感染人次', type: 'line', data: infectedTotal, showSymbol: false }
            ]
        };
        myChart.setOption(option);
    }
}