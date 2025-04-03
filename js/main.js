// メインの更新関数
function updateCalculations() {
  // 入力値を取得
  const inputs = getInputValues();
  
  // 各種計算を実行
  const initialInvestment = calculateInitialInvestment(inputs);
  const fixedCosts = calculateFixedCosts(inputs);
  const revenue = calculateRevenue(inputs);
  const variableCosts = calculateVariableCosts(revenue, inputs);
  const profit = calculateProfit(revenue, fixedCosts, variableCosts);
  const payback = calculatePaybackPeriod(initialInvestment.total, profit.monthly);
  const roi = calculateROI(profit.annual, initialInvestment.total);
  const seatUtilization = calculateSeatUtilization(inputs);
  const ratios = calculateRatios(inputs, revenue);
  
  // 損益分岐点の計算
  const breakEven = calculateBreakEven(fixedCosts, variableCosts, revenue);
  
  // 評価結果の取得
  const spendEvaluation = evaluateSpendPerCustomer(inputs.spend);
  const turnoverEvaluation = evaluateTurnover(inputs.turnover);
  const utilizationEvaluation = evaluateSeatUtilization(seatUtilization);
  const laborCostEvaluation = evaluateLaborCost(ratios.laborCost);
  const rentRatioEvaluation = evaluateRentRatio(ratios.rent);
  const costRatioEvaluation = evaluateCostRatio((fixedCosts.total + variableCosts.total) / revenue.monthly * 100);
  
  // 分析結果の生成
  const analysisSummary = generateAnalysisSummary(
    profit.monthly,
    profit.margin,
    payback ? payback.months.toFixed(1) : "計算不可",
    seatUtilization,
    ratios.laborCost,
    ratios.foodCost
  );
  
  // 表示を更新
  updateDisplayValues({
    totalInvestment: initialInvestment.total,
    monthlyRevenue: revenue.monthly,
    dailySales: revenue.daily,
    monthlyProfit: profit.monthly,
    profitMargin: profit.margin,
    paybackPeriod: payback ? payback.months.toFixed(1) : "計算不可",
    paybackYears: payback ? `約${payback.years.toFixed(1)}年` : "",
    roi: roi,
    breakEvenPoint: breakEven.revenue,
    breakEvenCustomers: breakEven.customers,
    spendAdequacy: spendEvaluation,
    seatTurnover: turnoverEvaluation,
    customerFulfillment: utilizationEvaluation,
    laborCostRatio: ratios.laborCost,
    laborRating: laborCostEvaluation,
    rentRatio: ratios.rent,
    rentRating: rentRatioEvaluation,
    totalMonthlyCost: fixedCosts.total + variableCosts.total,
    costRating: costRatioEvaluation,
    analysisSummary: analysisSummary
  });
  
  // グラフを更新
  const chartData = {
    foodCost: variableCosts.breakdown.foodCost,
    rent: fixedCosts.breakdown.rent,
    utilities: fixedCosts.breakdown.utilities,
    salaries: fixedCosts.breakdown.salaries,
    otherFixed: fixedCosts.breakdown.otherFixed,
    profit: Math.max(0, profit.monthly),
    renovation: initialInvestment.breakdown.renovation,
    equipment: initialInvestment.breakdown.equipment,
    furniture: initialInvestment.breakdown.furniture,
    deposit: initialInvestment.breakdown.deposit,
    otherInitial: initialInvestment.breakdown.otherInitial,
    cumulativeProfits: calculatePaybackChartData(profit.annual, 10),
    investmentLine: Array(11).fill(initialInvestment.total)
  };
  
  updateCharts(chartData);
}

// 表示値の更新
function updateDisplayValues(data) {
  // メインメトリクスの更新
  const monthlyProfitElement = document.getElementById('monthly_profit');
  monthlyProfitElement.textContent = Math.round(data.monthlyProfit);
  monthlyProfitElement.className = `metric-value ${data.monthlyProfit >= 0 ? 'positive' : 'negative'}`;

  document.getElementById('total_investment').textContent = Math.round(data.totalInvestment);
  document.getElementById('monthly_revenue').textContent = Math.round(data.monthlyRevenue);
  document.getElementById('sales_per_day').textContent = `1日あたり${Math.round(data.dailySales)}万円`;
  document.getElementById('profit_margin').textContent = `利益率${data.profitMargin.toFixed(1)}%`;
  
  const paybackElement = document.getElementById('payback_period');
  paybackElement.textContent = data.paybackPeriod;
  paybackElement.className = `metric-value ${data.monthlyProfit <= 0 ? 'negative' : (parseFloat(data.paybackPeriod) > 36 ? 'warning' : 'positive')}`;
  
  document.getElementById('payback_years').textContent = data.paybackYears;
  document.getElementById('roi').textContent = data.roi;
  
  // 詳細分析の更新
  document.getElementById('spend_adequacy').textContent = data.spendAdequacy.text;
  document.getElementById('spend_rating').innerHTML = data.spendAdequacy.rating;
  
  document.getElementById('seat_turnover').textContent = data.seatTurnover.text;
  document.getElementById('turnover_rating').innerHTML = data.seatTurnover.rating;
  
  document.getElementById('customer_fullfillment').textContent = data.customerFulfillment.text;
  document.getElementById('customer_rating').innerHTML = data.customerFulfillment.rating;
  
  document.getElementById('labor_cost_ratio').textContent = `${data.laborCostRatio.toFixed(1)}%`;
  document.getElementById('labor_rating').innerHTML = data.laborRating;
  
  document.getElementById('rent_ratio').textContent = `${data.rentRatio.toFixed(1)}%`;
  document.getElementById('rent_rating').innerHTML = data.rentRating;
  
  document.getElementById('total_monthly_cost').textContent = `${Math.round(data.totalMonthlyCost)}万円`;
  document.getElementById('cost_rating').innerHTML = data.costRating;
  
  document.getElementById('analysis_result').innerHTML = data.analysisSummary;
}

// 損益分岐点グラフのラベル計算
function calculateBreakEvenChartLabels(customers) {
  const customerIncrement = Math.ceil(customers * 1.4 / 8);
  return Array.from({length: 9}, (_, i) => (i * customerIncrement).toString());
}

// 損益分岐点グラフのデータ計算
function calculateBreakEvenChartData(inputs) {
  const customerIncrement = Math.ceil(inputs.customers * 1.4 / 8);
  const revenueData = [];
  const costData = [];
  const dailySpend = inputs.spend / 10000; // 万円に変換
  
  for (let i = 0; i <= 8; i++) {
    const currentCustomers = i * customerIncrement;
    const currentRevenue = currentCustomers * dailySpend * inputs.days;
    const variableCost = currentRevenue * (inputs.foodCostRate / 100);
    const totalCost = calculateFixedCosts(inputs).total + variableCost;
    
    revenueData.push(parseFloat(currentRevenue.toFixed(1)));
    costData.push(parseFloat(totalCost.toFixed(1)));
  }
  
  return { revenueData, costData };
}

// 投資回収グラフのデータ計算
function calculatePaybackChartData(annualProfit, years) {
  return Array.from({length: years}, (_, i) => parseFloat((annualProfit * (i + 1)).toFixed(1)));
}

// 入力値の保存
function saveInputValues() {
  const inputs = {
    renovation: document.getElementById('renovation').value,
    equipment: document.getElementById('equipment').value,
    furniture: document.getElementById('furniture').value,
    deposit: document.getElementById('deposit').value,
    other_initial: document.getElementById('other_initial').value,
    rent: document.getElementById('rent').value,
    utilities: document.getElementById('utilities').value,
    salaries: document.getElementById('salaries').value,
    other_fixed: document.getElementById('other_fixed').value,
    customers: document.getElementById('customers').value,
    spend: document.getElementById('spend').value,
    days: document.getElementById('days').value,
    food_cost: document.getElementById('food_cost').value,
    seats: document.getElementById('seats').value,
    turnover: document.getElementById('turnover').value
  };
  
  localStorage.setItem('restaurantPlannerInputs', JSON.stringify(inputs));
}

// 保存された入力値の読み込み
function loadInputValues() {
  const savedInputs = localStorage.getItem('restaurantPlannerInputs');
  if (savedInputs) {
    const inputs = JSON.parse(savedInputs);
    Object.keys(inputs).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = inputs[id];
      }
    });
    // 読み込み後に計算を実行
    updateCalculations();
  }
}

// データのリセット
function resetData() {
  if (confirm('入力データをリセットしてもよろしいですか？')) {
    // デフォルト値の設定
    const defaultValues = {
      renovation: 500,
      equipment: 300,
      furniture: 200,
      deposit: 100,
      other_initial: 100,
      rent: 20,
      utilities: 8,
      salaries: 80,
      other_fixed: 12,
      customers: 40,
      spend: 2000,
      days: 26,
      food_cost: 35,
      seats: 30,
      turnover: 2.5
    };

    // 各入力フィールドにデフォルト値を設定
    Object.keys(defaultValues).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = defaultValues[id];
      }
    });

    // ローカルストレージから保存データを削除
    localStorage.removeItem('restaurantPlannerInputs');

    // 計算を更新
    updateCalculations();
  }
}

// 履歴管理機能
const historyManager = {
  // 履歴の保存
  saveSnapshot: function(name, memo) {
    const inputs = {
      renovation: document.getElementById('renovation').value,
      equipment: document.getElementById('equipment').value,
      furniture: document.getElementById('furniture').value,
      deposit: document.getElementById('deposit').value,
      other_initial: document.getElementById('other_initial').value,
      rent: document.getElementById('rent').value,
      utilities: document.getElementById('utilities').value,
      salaries: document.getElementById('salaries').value,
      other_fixed: document.getElementById('other_fixed').value,
      customers: document.getElementById('customers').value,
      spend: document.getElementById('spend').value,
      days: document.getElementById('days').value,
      food_cost: document.getElementById('food_cost').value,
      seats: document.getElementById('seats').value,
      turnover: document.getElementById('turnover').value
    };

    const snapshot = {
      name: name,
      memo: memo,
      date: new Date().toLocaleString(),
      data: inputs
    };

    let history = JSON.parse(localStorage.getItem('restaurantPlannerHistory') || '[]');
    history.push(snapshot);
    localStorage.setItem('restaurantPlannerHistory', JSON.stringify(history));
  },

  // 履歴の読み込み
  loadSnapshot: function(index) {
    const history = JSON.parse(localStorage.getItem('restaurantPlannerHistory') || '[]');
    const snapshot = history[index];
    if (snapshot) {
      Object.keys(snapshot.data).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.value = snapshot.data[id];
        }
      });
      updateCalculations();
    }
  },

  // 履歴の削除
  deleteSnapshot: function(index) {
    let history = JSON.parse(localStorage.getItem('restaurantPlannerHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('restaurantPlannerHistory', JSON.stringify(history));
    this.displayHistory();
  },

  // 履歴一覧の表示
  displayHistory: function() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('restaurantPlannerHistory') || '[]');
    
    if (history.length === 0) {
      historyList.innerHTML = '<p>保存された履歴はありません。</p>';
      return;
    }

    historyList.innerHTML = history.map((snapshot, index) => `
      <div class="history-item">
        <div class="history-info">
          <div class="history-name">${snapshot.name}</div>
          <div class="history-date">${snapshot.date}</div>
          ${snapshot.memo ? `<div class="history-memo">${snapshot.memo}</div>` : ''}
        </div>
        <div class="history-actions">
          <button class="btn btn-primary" onclick="historyManager.loadSnapshot(${index})">読み込む</button>
          <button class="btn btn-danger" onclick="historyManager.deleteSnapshot(${index})">削除</button>
        </div>
      </div>
    `).join('');
  }
};

// モーダル管理
function initializeModals() {
  const historyModal = document.getElementById('historyModal');
  const saveModal = document.getElementById('saveModal');
  const showHistoryBtn = document.getElementById('showHistory');
  const saveSnapshotBtn = document.getElementById('saveSnapshot');
  const saveSnapshotConfirmBtn = document.getElementById('saveSnapshotConfirm');
  const closeBtns = document.getElementsByClassName('close');

  // 履歴表示ボタン
  showHistoryBtn.addEventListener('click', function() {
    historyModal.style.display = 'block';
    historyManager.displayHistory();
  });

  // 保存ボタン
  saveSnapshotBtn.addEventListener('click', function() {
    saveModal.style.display = 'block';
  });

  // 保存確認ボタン
  saveSnapshotConfirmBtn.addEventListener('click', function() {
    const name = document.getElementById('snapshotName').value;
    const memo = document.getElementById('snapshotMemo').value;
    
    if (!name) {
      alert('保存名を入力してください。');
      return;
    }
    
    historyManager.saveSnapshot(name, memo);
    saveModal.style.display = 'none';
    document.getElementById('snapshotName').value = '';
    document.getElementById('snapshotMemo').value = '';
  });

  // モーダルを閉じる
  Array.from(closeBtns).forEach(btn => {
    btn.addEventListener('click', function() {
      historyModal.style.display = 'none';
      saveModal.style.display = 'none';
    });
  });

  // モーダル外クリックで閉じる
  window.addEventListener('click', function(event) {
    if (event.target == historyModal) {
      historyModal.style.display = 'none';
    }
    if (event.target == saveModal) {
      saveModal.style.display = 'none';
    }
  });
}

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('初期化開始');
    
    // モーダルの初期化
    initializeModals();
    
    // リセットボタンのイベントリスナーを設定
    const resetButton = document.getElementById('resetData');
    if (resetButton) {
      resetButton.addEventListener('click', resetData);
    }
    
    // 保存された値を読み込む
    loadInputValues();
    
    // チャートの初期化を待つ
    setTimeout(() => {
      initCharts();
      console.log('チャート初期化完了');
      
      // 初期計算の実行
      updateCalculations();
      console.log('初期計算完了');
      
      // 入力フィールドの変更イベントリスナーを設定
      const inputFields = document.querySelectorAll('input[type="number"]');
      inputFields.forEach(field => {
        field.addEventListener('input', function() {
          try {
            updateCalculations();
            // 入力値を保存
            saveInputValues();
          } catch (error) {
            console.error('計算更新エラー:', error);
          }
        });
      });
    }, 100);
  } catch (error) {
    console.error('初期化エラー:', error);
  }
}); 