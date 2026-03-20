//records

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS_primary/records.css";

type Transaction = {
  _id: string;
  userId: string; // Added userId field
  name: string;
  date: string;
  category: string;
  amount: number;
  type: "Income" | "Expense";
};

type Category = {
  name: string;
  type: "Income" | "Expense";
};

const initialCategories: Category[] = [
  { name: "Salary", type: "Income" },
  { name: "Food", type: "Expense" },
  { name: "Rent", type: "Expense" },
  { name: "Bills", type: "Expense" },
  { name: "Salary", type: "Income" }
];


const Records: React.FC = () => {
  const [showAdd,setShowAdd]=useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, "_id">>({
    userId: "", // Store user ID
    name: "",
    date: "",
    category: "",
    amount: 0,
    type: "Expense",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Fetch user ID from local storage
        if (!userId) {
          console.error("User ID not found.");
          return;
        }

        setNewTransaction((prev) => ({ ...prev, userId }));

        const resTransactions = await axios.get(`http://localhost:5000/api/transactions/${userId}`);
        setTransactions(resTransactions.data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddTransaction = async () => {
    if (!newTransaction.name || !newTransaction.date || newTransaction.amount <= 0) {
      alert("Please fill in all the fields correctly.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve the JWT token
      if (!token) {
        alert("User is not authenticated.");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/transactions", newTransaction, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      });

      setTransactions([...transactions, res.data.transaction]);
      setNewTransaction({ ...newTransaction, name: "", date: "", category: "", amount: 0 });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      setTransactions(transactions.filter((tx) => tx._id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="heading">Add Transaction</h2>

        <input
          type="text"
          placeholder="Enter transaction name"
          value={newTransaction.name}
          onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
        />

        <input
          type="date"
          placeholder="Select date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
        />

        <div className="selectcateg">
          <select
            value={newTransaction.category}
            onChange={(e) => {
              const val = e.target.value;
              if (val == 'add_new') {
                setShowAdd(true);
              }
              else {
                setNewTransaction({
                  ...newTransaction, category: val
                });
              }
            }}
          >
            <option value="" disabled>Select category</option>
            {initialCategories
              .filter((cat) => cat.type === newTransaction.type)
              .map((category, index) => (
                <option key={index} value={category.name}>
                  {category.name}
                </option>
              ))}
            <option value="add_new">Add new category</option>
          </select>
          {showAdd && (
            <div>
              <input
                type="text"
                placeholder="Add custom category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button onClick={() => {
                if (!newCategory.trim()) return;

                setCategories([...categories,
                {
                  name: newCategory,
                  type: newTransaction.type

                }]);

                setNewCategory("");
                setShowAdd(false);
              }}>Add</button>
            </div>
          )}
        </div>

        <input
          type="number"
          placeholder="Enter amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
        />

        <div className="selectcateg">
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as "Income" | "Expense" })}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>

        <button onClick={handleAddTransaction}>Add Transaction</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className={tx.type === "Income" ? "income" : "expense"}>{tx.type}</td>
                  <td>{new Date(tx.date).toLocaleDateString("en-IN")}</td>
                  <td>{tx.category}</td>
                  <td>${tx.amount}</td>
                  <td>{tx.name}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteTransaction(tx._id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>No transactions added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;