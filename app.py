from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/sir', methods=['POST'])
def sir_model():
    data = request.get_json()
    N = int(data.get('N', 1000))
    I = int(data.get('I0', 1))
    R = int(data.get('R0', 0))
    D = 0  # 新增死亡人数
    S = N - I - R
    beta = float(data.get('beta', 0.3))
    gamma = float(data.get('gamma', 0.1))
    mu = float(data.get('mu', 0.01))  # 新增死亡率参数，前端需同步增加
    days = int(data.get('days', 160))

    S_list = [S]
    I_list = [I]
    R_list = [R]
    D_list = [D]
    for _ in range(days):
        new_infected = beta * S * I / N
        new_recovered = gamma * I
        new_death = mu * I
        S = S - new_infected
        I = I + new_infected - new_recovered - new_death
        R = R + new_recovered
        D = D + new_death
        # 防止负数
        S = max(S, 0)
        I = max(I, 0)
        R = max(R, 0)
        D = max(D, 0)
        # 总人数守恒
        total = S + I + R + D
        if abs(total - N) > 1e-6:
            S += N - total
        S_list.append(S)
        I_list.append(I)
        R_list.append(R)
        D_list.append(D)
    # 输出时统一四舍五入
    return jsonify({
        'S': [round(x) for x in S_list],
        'I': [round(x) for x in I_list],
        'R': [round(x) for x in R_list],
        'D': [round(x) for x in D_list],
        'days': list(range(days + 1))
    })

if __name__ == '__main__':
    app.run(debug=True)