// ========================= //
//     MONEY APP SCRIPT      //
// ========================= //
console.log("Loading Money Manager script...")

class MoneyManager {
  constructor() {
    this.balance = 0
    this.transactions = []
    this.currentFilter = "all"
    this.currentAction = null

    this.init()
  }

  init() {
    console.log("Initializing Money Manager...")
    this.loadData()
    this.bindEvents()
    this.updateUI()
    console.log("Money Manager initialized successfully!")
  }

  bindEvents() {
    // Header buttons
    document.getElementById("saveBtn").addEventListener("click", () => this.saveData())
    document.getElementById("loadBtn").addEventListener("click", () => this.loadData())
    document.getElementById("themeBtn").addEventListener("click", () => this.toggleTheme())

    // Action buttons
    document.getElementById("cashInBtn").addEventListener("click", () => this.openModal("income"))
    document.getElementById("cashOutBtn").addEventListener("click", () => this.openModal("expense"))

    // Modal controls
    document.getElementById("closeBtn").addEventListener("click", () => this.closeModal())
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") {
        this.closeModal()
      }
    })

    // Form submission
    document.getElementById("transactionForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSubmit()
    })

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.setFilter(btn.dataset.filter))
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal()
      }
    })

    console.log("Events bound successfully")
  }

  openModal(action) {
    this.currentAction = action
    const modal = document.getElementById("modalOverlay")
    const title = document.getElementById("modalTitle")
    const submitBtn = document.getElementById("submitBtn")

    if (action === "income") {
      title.textContent = "Add Income"
      submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Income'
      submitBtn.className = "btn btn-submit btn-income"
    } else {
      title.textContent = "Add Expense"
      submitBtn.innerHTML = '<i class="fas fa-minus"></i> Add Expense'
      submitBtn.className = "btn btn-submit btn-expense"
    }

    modal.classList.add("show")
    document.getElementById("amount").focus()
    this.clearForm()
  }

  closeModal() {
    const modal = document.getElementById("modalOverlay")
    modal.classList.remove("show")
    this.currentAction = null
    this.clearForm()
  }

  clearForm() {
    document.getElementById("amount").value = ""
    document.getElementById("description").value = ""
  }

  handleSubmit() {
    const amount = Number.parseFloat(document.getElementById("amount").value)
    const description = document.getElementById("description").value.trim()

    // Validation
    if (!amount || amount <= 0) {
      this.showNotification("Please enter a valid amount", "error")
      return
    }

    if (!description) {
      this.showNotification("Please enter a description", "error")
      return
    }

    // Check for sufficient balance on expenses
    if (this.currentAction === "expense" && amount > this.balance) {
      this.showNotification("Insufficient balance", "error")
      return
    }

    // Create transaction
    const transaction = {
      id: Date.now(),
      type: this.currentAction,
      amount: amount,
      description: description,
      date: new Date().toISOString(),
    }

    // Update balance
    if (this.currentAction === "income") {
      this.balance += amount
    } else {
      this.balance -= amount
    }

    // Add transaction
    this.transactions.unshift(transaction)

    // Update UI
    this.updateUI()
    this.closeModal()
    this.saveData()

    const actionText = this.currentAction === "income" ? "Income" : "Expense"
    this.showNotification(`${actionText} of $${amount.toFixed(2)} added successfully`, "success")
  }

  deleteTransaction(id) {
    const transaction = this.transactions.find((t) => t.id === id)
    if (!transaction) return

    if (confirm(`Delete ${transaction.type} of $${transaction.amount.toFixed(2)}?`)) {
      // Reverse balance change
      if (transaction.type === "income") {
        this.balance -= transaction.amount
      } else {
        this.balance += transaction.amount
      }

      // Remove transaction
      this.transactions = this.transactions.filter((t) => t.id !== id)

      // Update UI
      this.updateUI()
      this.saveData()
      this.showNotification("Transaction deleted", "success")
    }
  }

  setFilter(filter) {
    this.currentFilter = filter

    // Update active button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active")

    this.renderTransactions()
  }

  updateUI() {
    this.updateBalance()
    this.renderTransactions()
  }

  updateBalance() {
    const balanceElement = document.getElementById("balanceAmount")
    balanceElement.textContent = `$${this.balance.toFixed(2)}`

    // Color coding
    if (this.balance > 0) {
      balanceElement.style.color = "var(--success-color)"
    } else if (this.balance < 0) {
      balanceElement.style.color = "var(--danger-color)"
    } else {
      balanceElement.style.color = "var(--text-color)"
    }

    // Animation
    balanceElement.style.transform = "scale(1.05)"
    setTimeout(() => {
      balanceElement.style.transform = "scale(1)"
    }, 200)
  }

  renderTransactions() {
    const container = document.getElementById("transactionsList")

    // Filter transactions
    let filteredTransactions = this.transactions
    if (this.currentFilter !== "all") {
      filteredTransactions = this.transactions.filter((t) => t.type === this.currentFilter)
    }

    if (filteredTransactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-wallet"></i>
          <p>No transactions found</p>
          <small>Start by adding your first transaction</small>
        </div>
      `
      return
    }

    container.innerHTML = filteredTransactions
      .map((transaction) => {
        const date = new Date(transaction.date)
        const formattedDate =
          date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const sign = transaction.type === "income" ? "+" : "-"

        return `
        <div class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-description">${transaction.description}</div>
            <div class="transaction-date">${formattedDate}</div>
          </div>
          <div class="transaction-amount ${transaction.type}">
            ${sign}$${transaction.amount.toFixed(2)}
          </div>
          <button class="delete-btn" onclick="app.deleteTransaction(${transaction.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
      })
      .join("")
  }

  toggleTheme() {
    const body = document.body
    const themeBtn = document.getElementById("themeBtn")
    const icon = themeBtn.querySelector("i")

    if (body.hasAttribute("data-theme")) {
      body.removeAttribute("data-theme")
      icon.className = "fas fa-moon"
      localStorage.setItem("theme", "light")
    } else {
      body.setAttribute("data-theme", "dark")
      icon.className = "fas fa-sun"
      localStorage.setItem("theme", "dark")
    }

    this.showNotification("Theme changed", "info")
  }

  saveData() {
    try {
      const data = {
        balance: this.balance,
        transactions: this.transactions,
        timestamp: Date.now(),
      }
      localStorage.setItem("moneyManagerData", JSON.stringify(data))
      this.showNotification("Data saved successfully", "success")
    } catch (error) {
      console.error("Save error:", error)
      this.showNotification("Failed to save data", "error")
    }
  }

  loadData() {
    try {
      const savedData = localStorage.getItem("moneyManagerData")
      if (savedData) {
        const data = JSON.parse(savedData)
        this.balance = data.balance || 0
        this.transactions = data.transactions || []
        this.updateUI()
        this.showNotification("Data loaded successfully", "success")
      } else {
        this.showNotification("No saved data found", "info")
      }
    } catch (error) {
      console.error("Load error:", error)
      this.showNotification("Failed to load data", "error")
    }

    // Load theme
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.body.setAttribute("data-theme", "dark")
      document.getElementById("themeBtn").querySelector("i").className = "fas fa-sun"
    }
  }

  showNotification(message, type = "info") {
    const notification = document.getElementById("notification")
    notification.textContent = message
    notification.className = `notification ${type}`

    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    // Hide notification
    setTimeout(() => {
      notification.classList.remove("show")
    }, 3000)
  }

  // Utility method to get statistics
  getStats() {
    const income = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = this.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      balance: this.balance,
      totalIncome: income,
      totalExpenses: expenses,
      transactionCount: this.transactions.length,
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, starting app...")
  window.app = new MoneyManager()

  // Add some helpful console methods
  console.log("💰 Money Manager is ready!")
  console.log("💡 Try: app.getStats() to see your financial summary")
})

// Auto-save on page unload
window.addEventListener("beforeunload", () => {
  if (window.app) {
    window.app.saveData()
  }
})
