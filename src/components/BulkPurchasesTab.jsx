import { useEffect, useMemo, useState } from 'react';

import {
  getBulkPurchasesForApartment,
  createBulkPurchase,
  updateBulkPurchase,
  deleteBulkPurchase,
  getLatestCostPerUnit
} from '../Api/commercialApi';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';



export default function BulkPurchasesTab({ apartmentId }) {

  // =========================================================
  // PURCHASE HISTORY
  // =========================================================

  const [purchases, setPurchases] = useState([]);

  // =========================================================
  // DAILY WATER READINGS
  // =========================================================

  const [dailySupply, setDailySupply] = useState([]);

  const [supplyDate, setSupplyDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [supplyAmount, setSupplyAmount] = useState('');

  const [editingSupplyId, setEditingSupplyId] = useState(null);

  // =========================================================
  // MONTH / YEAR
  // =========================================================

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const [period, setPeriod] = useState('month');

  // =========================================================
  // COST CALCULATION
  // =========================================================

  const [csvFile, setCsvFile] = useState(null);

  const [csvRecords, setCsvRecords] = useState([]);

  const [costPerUnit, setCostPerUnit] = useState('');

  const [calculatedTotalWater, setCalculatedTotalWater] = useState(0);

  const [calculatedTotalCost, setCalculatedTotalCost] = useState(0);

  const [billCalculated, setBillCalculated] = useState(false);

  // =========================================================
  // EDIT PURCHASE
  // =========================================================

  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // UI
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState('');

  const [msgType, setMsgType] = useState('info');

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  const storageKey = apartmentId
    ? `apartment_water_supply_${apartmentId}`
    : null;

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    if (!apartmentId) return;

    loadData();
    loadDailySupply();

  }, [apartmentId]);

  // =========================================================
  // LOAD PURCHASE DATA
  // =========================================================

  const loadData = async () => {

    setLoading(true);

    try {

      const [purchaseRes, costRes] = await Promise.all([
        getBulkPurchasesForApartment(apartmentId),
        getLatestCostPerUnit(apartmentId)
      ]);

      setPurchases(purchaseRes.data || []);

      const latestCost =
        Number(costRes.data?.costPerUnit || 0);

      if (latestCost > 0) {
        setCostPerUnit(latestCost.toString());
      }

    } catch (error) {

      console.error(error);

      try {

        const purchaseRes =
          await getBulkPurchasesForApartment(apartmentId);

        setPurchases(purchaseRes.data || []);

      } catch (secondError) {

        console.error(secondError);

        showMessage(
          secondError.response?.data?.message ||
          'Failed to load bulk purchase data.',
          'error'
        );

      }

    } finally {

      setLoading(false);

    }

  };

  // =========================================================
  // LOAD DAILY READINGS
  // =========================================================

  const loadDailySupply = () => {

    if (!storageKey) return;

    try {

      const saved =
        localStorage.getItem(storageKey);

      if (!saved) {

        setDailySupply([]);

        return;

      }

      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {

        setDailySupply(parsed);

      } else {

        setDailySupply([]);

      }

    } catch (error) {

      console.error(error);

      setDailySupply([]);

    }

  };

  // =========================================================
  // SAVE DAILY READINGS
  // =========================================================

  const persistDailySupply = (data) => {

    if (!storageKey) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify(data)
    );

    setDailySupply(data);

  };

  // =========================================================
  // MESSAGE
  // =========================================================

  const showMessage = (message, type = 'info') => {

    setMsg(message);

    setMsgType(type);

  };

  // =========================================================
  // ADD / UPDATE DAILY READING
  // =========================================================

  const handleSaveDailySupply = () => {

    setMsg('');

    if (!supplyDate) {

      showMessage(
        'Please select a date.',
        'error'
      );

      return;

    }

    const amount =
      Number(supplyAmount);

    if (!amount || amount <= 0) {

      showMessage(
        'Please enter a valid water supplied amount.',
        'error'
      );

      return;

    }

    let updated;

    if (editingSupplyId) {

      updated =
        dailySupply.map(item =>

          item.id === editingSupplyId
            ? {
                ...item,
                date: supplyDate,
                waterSupplied: amount
              }
            : item

        );

    } else {

      const existingDate =
        dailySupply.find(
          item => item.date === supplyDate
        );

      if (existingDate) {

        showMessage(
          'A reading already exists for this date. Edit the existing reading instead.',
          'error'
        );

        return;

      }

      const newEntry = {

        id:
          `daily-${Date.now()}`,

        date:
          supplyDate,

        waterSupplied:
          amount

      };

      updated = [
        ...dailySupply,
        newEntry
      ];

    }

    updated.sort(
      (a, b) =>
        a.date.localeCompare(b.date)
    );

    persistDailySupply(updated);

    setSupplyAmount('');

    setEditingSupplyId(null);

    showMessage(
      editingSupplyId
        ? 'Daily water reading updated successfully.'
        : 'Daily water reading added successfully.',
      'success'
    );

  };

  // =========================================================
  // EDIT DAILY READING
  // =========================================================

  const handleEditDailySupply = (item) => {

    setSupplyDate(item.date);

    setSupplyAmount(
      item.waterSupplied
    );

    setEditingSupplyId(item.id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  };

  // =========================================================
  // DELETE DAILY READING
  // =========================================================

  const handleDeleteDailySupply = (id) => {

    if (
      !window.confirm(
        'Delete this daily water reading?'
      )
    ) {
      return;
    }

    const updated =
      dailySupply.filter(
        item => item.id !== id
      );

    persistDailySupply(updated);

    if (editingSupplyId === id) {

      setEditingSupplyId(null);

      setSupplyAmount('');

    }

    showMessage(
      'Daily water reading deleted.',
      'success'
    );

  };

  // =========================================================
  // CANCEL DAILY EDIT
  // =========================================================

  const cancelDailyEdit = () => {

    setEditingSupplyId(null);

    setSupplyAmount('');

  };

  // =========================================================
  // SELECTED MONTH READINGS
  // =========================================================

  const selectedMonthSupply = useMemo(() => {

    return dailySupply
      .filter(
        item =>
          item.date?.startsWith(selectedMonth)
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date)
      );

  }, [
    dailySupply,
    selectedMonth
  ]);

  // =========================================================
  // SELECTED YEAR READINGS
  // =========================================================

  const selectedYearSupply = useMemo(() => {

    return dailySupply
      .filter(
        item =>
          item.date?.startsWith(selectedYear)
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date)
      );

  }, [
    dailySupply,
    selectedYear
  ]);

  // =========================================================
  // CURRENT PERIOD READINGS
  // =========================================================

  const currentPeriodReadings =
    period === 'month'
      ? selectedMonthSupply
      : selectedYearSupply;

  // =========================================================
  // TOTAL CURRENT PERIOD WATER
  // =========================================================

  const currentPeriodTotal =
    Number(
      currentPeriodReadings
        .reduce(
          (total, item) =>
            total +
            Number(item.waterSupplied || 0),
          0
        )
        .toFixed(2)
    );

  // =========================================================
  // DOWNLOAD CSV
  // =========================================================

  const downloadCurrentCSV = () => {

    if (
      currentPeriodReadings.length === 0
    ) {

      showMessage(
        `No water readings available for ${
          period === 'month'
            ? selectedMonth
            : selectedYear
        }.`,
        'error'
      );

      return;

    }

    const header =
      'Date,Water Supplied';

    const rows =
      currentPeriodReadings.map(
        item =>
          `${item.date},${item.waterSupplied}`
      );

    const csv =
      [header, ...rows].join('\n');

    const filename =
      period === 'month'
        ? `water-readings-${selectedMonth}.csv`
        : `water-readings-${selectedYear}.csv`;

    downloadCSV(
      csv,
      filename
    );

    showMessage(
      `CSV downloaded successfully for ${
        period === 'month'
          ? selectedMonth
          : selectedYear
      }.`,
      'success'
    );

  };

  // =========================================================
  // GENERIC CSV DOWNLOAD
  // =========================================================

  const downloadCSV = (
    csv,
    filename
  ) => {

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  };

  // =========================================================
  // CSV UPLOAD FOR COST CALCULATION
  // =========================================================

  const handleCSVUpload = async (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    setCsvFile(file);

    setBillCalculated(false);

    setCalculatedTotalWater(0);

    setCalculatedTotalCost(0);

    try {

      if (
        !file.name
          .toLowerCase()
          .endsWith('.csv')
      ) {

        throw new Error(
          'Please upload a CSV file.'
        );

      }

      const text =
        await file.text();

      const lines =
        text
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(Boolean);

      if (lines.length < 2) {

        throw new Error(
          'CSV file does not contain water reading data.'
        );

      }

      const header =
        lines[0]
          .toLowerCase()
          .replace(/\s/g, '');

      if (
        !header.includes('date') ||
        !header.includes('watersupplied')
      ) {

        throw new Error(
          'CSV format must be: Date,Water Supplied'
        );

      }

      const importedRecords = [];

      for (
        let i = 1;
        i < lines.length;
        i++
      ) {

        const columns =
          lines[i].split(',');

        if (columns.length < 2) {
          continue;
        }

        const date =
          columns[0].trim();

        const amount =
          Number(
            columns[1].trim()
          );

        if (
          !date ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          continue;
        }

        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
          continue;
        }

        importedRecords.push({

          date,

          waterSupplied:
            amount

        });

      }

      if (
        importedRecords.length === 0
      ) {

        throw new Error(
          'No valid water readings found in CSV.'
        );

      }

      setCsvRecords(
        importedRecords
      );

      showMessage(
        `${importedRecords.length} daily readings loaded from CSV. Enter cost per unit and click Calculate Bill.`,
        'success'
      );

    } catch (error) {

      console.error(error);

      setCsvFile(null);

      setCsvRecords([]);

      showMessage(
        error.message ||
        'Failed to read CSV file.',
        'error'
      );

    } finally {

      event.target.value = '';

    }

  };

  // =========================================================
  // CSV TOTAL
  // =========================================================

  const uploadedCSVTotal = useMemo(() => {

    return Number(
      csvRecords
        .reduce(
          (total, item) =>
            total +
            Number(
              item.waterSupplied || 0
            ),
          0
        )
        .toFixed(2)
    );

  }, [csvRecords]);

  // =========================================================
  // CALCULATE BILL
  // =========================================================

  const calculateBill = () => {

    setMsg('');

    if (
      csvRecords.length === 0
    ) {

      showMessage(
        'Please upload the monthly water readings CSV first.',
        'error'
      );

      return;

    }

    const unitCost =
      Number(costPerUnit);

    if (
      !Number.isFinite(unitCost) ||
      unitCost <= 0
    ) {

      showMessage(
        'Please enter a valid cost per unit.',
        'error'
      );

      return;

    }

    const total =
      Number(
        (
          uploadedCSVTotal *
          unitCost
        ).toFixed(2)
      );

    setCalculatedTotalWater(
      uploadedCSVTotal
    );

    setCalculatedTotalCost(
      total
    );

    setBillCalculated(true);

    showMessage(
      'Bill calculated successfully. Review the amount and click Save Purchase.',
      'success'
    );

  };

  // =========================================================
  // SAVE PURCHASE
  // =========================================================

  const saveBulkPurchase = async () => {

    if (!billCalculated) {

      showMessage(
        'Please calculate the bill before saving.',
        'error'
      );

      return;

    }

    if (
      calculatedTotalWater <= 0 ||
      calculatedTotalCost <= 0
    ) {

      showMessage(
        'Invalid calculated bill amount.',
        'error'
      );

      return;

    }

    setSaving(true);

    try {

      let purchaseDate;

      let remarks;

      if (period === 'month') {

        purchaseDate =
          `${selectedMonth}-01`;

        remarks =
          `Monthly water supply purchase for ${selectedMonth}`;

      } else {

        purchaseDate =
          `${selectedYear}-01-01`;

        remarks =
          `Yearly water supply purchase for ${selectedYear}`;

      }

      const data = {

        apartmentId:

          apartmentId,

        purchaseDate:

          purchaseDate,

        quantityPurchased:

          calculatedTotalWater,

        totalCost:

          calculatedTotalCost,

        supplierName:

          'Admin Water Supply',

        remarks:

          remarks

      };

      if (editingId) {

        await updateBulkPurchase(
          editingId,
          data
        );

        showMessage(
          'Bulk water purchase updated successfully.',
          'success'
        );

      } else {

        await createBulkPurchase(
          data
        );

        showMessage(
          'Bulk water purchase saved successfully.',
          'success'
        );

      }

      setEditingId(null);

      await loadData();

      // Reset calculation area

      setCsvFile(null);

      setCsvRecords([]);

      setCalculatedTotalWater(0);

      setCalculatedTotalCost(0);

      setBillCalculated(false);

    } catch (error) {

      console.error(error);

      showMessage(
        error.response?.data?.message ||
        'Failed to save bulk water purchase.',
        'error'
      );

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // EDIT PURCHASE
  // =========================================================

  const handleEdit = (purchase) => {

    setEditingId(
      purchase.id
    );

    const date =
      purchase.purchaseDate || '';

    if (date.length >= 7) {

      setSelectedMonth(
        date.substring(0, 7)
      );

      setSelectedYear(
        date.substring(0, 4)
      );

    }

    const quantity =
      Number(
        purchase.quantityPurchased || 0
      );

    const total =
      Number(
        purchase.totalCost || 0
      );

    if (
      quantity > 0 &&
      total > 0
    ) {

      setCostPerUnit(
        (total / quantity).toFixed(2)
      );

      setCalculatedTotalWater(
        quantity
      );

      setCalculatedTotalCost(
        total
      );

      setBillCalculated(true);

    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  };

  // =========================================================
  // DELETE PURCHASE
  // =========================================================

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        'Delete this bulk purchase record?'
      )
    ) {

      return;

    }

    try {

      await deleteBulkPurchase(id);

      setPurchases(
        prev =>
          prev.filter(
            p => p.id !== id
          )
      );

      showMessage(
        'Bulk purchase deleted successfully.',
        'success'
      );

    } catch (error) {

      console.error(error);

      showMessage(
        error.response?.data?.message ||
        'Failed to delete purchase.',
        'error'
      );

    }

  };

  // =========================================================
  // CANCEL PURCHASE EDIT
  // =========================================================

  const cancelPurchaseEdit = () => {

    setEditingId(null);

    setCsvFile(null);

    setCsvRecords([]);

    setCalculatedTotalWater(0);

    setCalculatedTotalCost(0);

    setBillCalculated(false);

  };

  // =========================================================
  // MONTHLY CHART
  // =========================================================

  const monthlyChartData =
    useMemo(() => {

      const map = {};

      purchases.forEach(p => {

        if (!p.purchaseDate) return;

        const month =
          p.purchaseDate.substring(
            0,
            7
          );

        if (!map[month]) {

          map[month] = {

            month,

            quantity: 0,

            cost: 0

          };

        }

        map[month].quantity +=
          Number(
            p.quantityPurchased || 0
          );

        map[month].cost +=
          Number(
            p.totalCost || 0
          );

      });

      return Object.values(map)
        .sort(
          (a, b) =>
            a.month.localeCompare(
              b.month
            )
        );

    }, [purchases]);

  // =========================================================
  // YEARLY CHART
  // =========================================================

  const yearlyChartData =
    useMemo(() => {

      const map = {};

      purchases.forEach(p => {

        if (!p.purchaseDate) return;

        const year =
          p.purchaseDate.substring(
            0,
            4
          );

        if (!map[year]) {

          map[year] = {

            year,

            quantity: 0,

            cost: 0

          };

        }

        map[year].quantity +=
          Number(
            p.quantityPurchased || 0
          );

        map[year].cost +=
          Number(
            p.totalCost || 0
          );

      });

      return Object.values(map)
        .sort(
          (a, b) =>
            a.year.localeCompare(
              b.year
            )
        );

    }, [purchases]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="dash-section">

        <div className="loading-box">

          Loading bulk water purchase data...

        </div>

      </div>

    );

  }

  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="bulk-purchase-module">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dash-section bulk-header-section">

        <div className="dash-section-head">

          <div>

            <h2>
              Bulk Water Purchase Management
            </h2>

            <p className="module-subtitle">
              Record daily water supply, download monthly
              readings, calculate the water cost and save
              the final purchase.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {msg && (

        <div
          className={`bulk-message ${
            msgType === 'error'
              ? 'bulk-message-error'
              : 'bulk-message-success'
          }`}
        >

          {msg}

        </div>

      )}

      {/* =====================================================
          STEP 1 - DAILY READINGS
      ===================================================== */}

      <div className="dash-section">

        <div className="bulk-step-header">

          <div className="step-number">
            1
          </div>

          <div>

            <h2>
              Daily Water Readings
            </h2>

            <p>
              Enter the water supplied to the apartment
              each day. No cost is calculated here.
            </p>

          </div>

        </div>

        <div className="bulk-input-grid">

          <div className="bulk-field">

            <label>
              Reading Date
            </label>

            <input
              type="date"
              value={supplyDate}
              onChange={e =>
                setSupplyDate(
                  e.target.value
                )
              }
            />

          </div>

          <div className="bulk-field">

            <label>
              Water Supplied
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Example: 500"
              value={supplyAmount}
              onChange={e =>
                setSupplyAmount(
                  e.target.value
                )
              }
            />

            <span>
              Enter quantity in water units
            </span>

          </div>

          <div className="bulk-action-field">

            <button
              className="bulk-primary-btn"
              onClick={
                handleSaveDailySupply
              }
            >

              {editingSupplyId
                ? 'Update Reading'
                : '+ Add Reading'}

            </button>

            {editingSupplyId && (

              <button
                className="bulk-secondary-btn"
                onClick={
                  cancelDailyEdit
                }
              >
                Cancel
              </button>

            )}

          </div>

        </div>

        <div className="bulk-table-wrapper">

          <table className="data-table">

            <thead>

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Water Supplied
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {dailySupply.length === 0 ? (

                <tr>

                  <td
                    colSpan={3}
                    className="empty-state"
                  >

                    No daily water readings added yet.

                  </td>

                </tr>

              ) : (

                dailySupply
                  .slice()
                  .sort(
                    (a, b) =>
                      b.date.localeCompare(
                        a.date
                      )
                  )
                  .map(item => (

                    <tr
                      key={item.id}
                    >

                      <td>
                        {item.date}
                      </td>

                      <td>
                        {Number(
                          item.waterSupplied
                        ).toFixed(2)}
                        {' '}units
                      </td>

                      <td>

                        <button
                          className="btn-sm btn-approve"
                          onClick={() =>
                            handleEditDailySupply(
                              item
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn-sm btn-reject"
                          style={{
                            marginLeft: 8
                          }}
                          onClick={() =>
                            handleDeleteDailySupply(
                              item.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          STEP 2 - MONTHLY CSV
      ===================================================== */}

      <div className="dash-section">

        <div className="bulk-step-header">

          <div className="step-number">
            2
          </div>

          <div>

            <h2>
              End-of-Month Readings
            </h2>

            <p>
              Select the period and download the completed
              water readings as a CSV file.
            </p>

          </div>

        </div>

        <div className="period-selector">

          <button
            className={
              period === 'month'
                ? 'period-btn active'
                : 'period-btn'
            }
            onClick={() =>
              setPeriod('month')
            }
          >
            Monthly
          </button>

          <button
            className={
              period === 'year'
                ? 'period-btn active'
                : 'period-btn'
            }
            onClick={() =>
              setPeriod('year')
            }
          >
            Yearly
          </button>

        </div>

        <div className="bulk-period-controls">

          {period === 'month' ? (

            <div className="bulk-field">

              <label>
                Select Month
              </label>

              <input
                type="month"
                value={selectedMonth}
                onChange={e =>
                  setSelectedMonth(
                    e.target.value
                  )
                }
              />

            </div>

          ) : (

            <div className="bulk-field">

              <label>
                Select Year
              </label>

              <select
                value={selectedYear}
                onChange={e =>
                  setSelectedYear(
                    e.target.value
                  )
                }
              >

                {Array.from(
                  {
                    length: 6
                  },
                  (_, i) => {

                    const year =
                      new Date()
                        .getFullYear() - i;

                    return (

                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>

                    );

                  }
                )}

              </select>

            </div>

          )}

          <div className="period-summary">

            <strong>
              {currentPeriodTotal.toFixed(2)}
            </strong>

            <span>
              Total units
            </span>

            <small>
              {currentPeriodReadings.length}
              {' '}daily readings
            </small>

          </div>

        </div>

        <div className="csv-download-box">

          <div>

            <h3>
              Download Readings CSV
            </h3>

            <p>
              Download the selected period's readings.
              You will upload this same CSV in the next step
              to calculate the cost.
            </p>

          </div>

          <button
            className="bulk-primary-btn"
            onClick={
              downloadCurrentCSV
            }
          >
            ↓ Download CSV
          </button>

        </div>

      </div>

      {/* =====================================================
          STEP 3 - CALCULATE COST
      ===================================================== */}

      <div className="dash-section cost-calculation-section">

        <div className="bulk-step-header">

          <div className="step-number">
            3
          </div>

          <div>

            <h2>
              Calculate Water Supply Cost
            </h2>

            <p>
              Upload the CSV downloaded above, enter the
              cost per unit and calculate the final amount.
            </p>

          </div>

        </div>

        <div className="cost-calculation-card">

          {/* CSV UPLOAD */}

          <div className="calculation-field">

            <label>
              1. Upload Monthly Readings CSV
            </label>

            <label className="csv-upload-area">

              <span className="upload-icon">
                ↑
              </span>

              <strong>
                {csvFile
                  ? csvFile.name
                  : 'Choose the downloaded CSV file'}
              </strong>

              <small>
                CSV format: Date, Water Supplied
              </small>

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={
                  handleCSVUpload
                }
              />

            </label>

            {csvRecords.length > 0 && (

              <div className="csv-loaded-info">

                ✓ {csvRecords.length}
                {' '}readings loaded

                <strong>
                  Total: {uploadedCSVTotal.toFixed(2)}
                  {' '}units
                </strong>

              </div>

            )}

          </div>

          {/* COST INPUT */}

          <div className="calculation-field">

            <label>
              2. Cost Per Unit
            </label>

            <div className="rupee-input">

              <span>
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter cost per unit"
                value={costPerUnit}
                onChange={e => {

                  setCostPerUnit(
                    e.target.value
                  );

                  setBillCalculated(false);

                }}
              />

            </div>

            <small>
              Example: ₹2.50 per unit
            </small>

          </div>

          {/* CALCULATE BUTTON */}

          <button
            className="calculate-bill-btn"
            onClick={
              calculateBill
            }
          >

            Calculate Bill

          </button>

          {/* RESULT */}

          {billCalculated && (

            <div className="calculation-result">

              <div className="result-title">
                Bill Calculation Result
              </div>

              <div className="result-grid">

                <div className="result-item">

                  <span>
                    Total Water
                  </span>

                  <strong>
                    {calculatedTotalWater.toFixed(2)}
                    {' '}units
                  </strong>

                </div>

                <div className="result-item">

                  <span>
                    Cost Per Unit
                  </span>

                  <strong>
                    ₹{Number(
                      costPerUnit
                    ).toFixed(2)}
                  </strong>

                </div>

                <div className="result-item total-result">

                  <span>
                    Total Cost
                  </span>

                  <strong>
                    ₹{calculatedTotalCost.toFixed(2)}
                  </strong>

                </div>

              </div>

              <div className="calculation-formula">

                {calculatedTotalWater.toFixed(2)}
                {' × '}
                ₹{Number(costPerUnit).toFixed(2)}
                {' = '}
                <strong>
                  ₹{calculatedTotalCost.toFixed(2)}
                </strong>

              </div>

            </div>

          )}

          {/* SAVE */}

          {billCalculated && (

            <div className="save-purchase-area">

              <button
                className="save-purchase-btn"
                onClick={
                  saveBulkPurchase
                }
                disabled={saving}
              >

                {saving
                  ? 'Saving Purchase...'
                  : editingId
                    ? 'Save Updated Purchase'
                    : '✓ Save Purchase'}

              </button>

              {editingId && (

                <button
                  className="bulk-secondary-btn"
                  onClick={
                    cancelPurchaseEdit
                  }
                >
                  Cancel
                </button>

              )}

              <p>
                The purchase will be added to Bulk Purchase
                History only after clicking Save Purchase.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          STEP 4 - CHART
      ===================================================== */}

      <div className="dash-section">

        <div className="bulk-step-header">

          <div className="step-number">
            4
          </div>

          <div>

            <h2>
              Purchase Analysis
            </h2>

            <p>
              View saved bulk water purchases.
            </p>

          </div>

        </div>

        {(period === 'month'
          ? monthlyChartData
          : yearlyChartData
        ).length === 0 ? (

          <p className="empty-state">
            No purchase data available.
          </p>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            {period === 'month' ? (

              <LineChart
                data={
                  monthlyChartData
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="quantity"
                  name="Water Quantity"
                  stroke="#0f766e"
                  strokeWidth={3}
                />

                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Total Cost"
                  stroke="#16a34a"
                  strokeWidth={3}
                />

              </LineChart>

            ) : (

              <BarChart
                data={
                  yearlyChartData
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="year"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="quantity"
                  name="Water Quantity"
                  fill="#0f766e"
                />

                <Bar
                  dataKey="cost"
                  name="Total Cost"
                  fill="#16a34a"
                />

              </BarChart>

            )}

          </ResponsiveContainer>

        )}

      </div>

      {/* =====================================================
          STEP 5 - HISTORY
      ===================================================== */}

      <div className="dash-section">

        <div className="bulk-step-header">

          <div className="step-number">
            5
          </div>

          <div>

            <h2>
              Bulk Purchase History
            </h2>

            <p>
              Previously saved water supply purchases.
            </p>

          </div>

        </div>

        <div className="bulk-table-wrapper">

          <table className="data-table">

            <thead>

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Water Supplied
                </th>

                <th>
                  Cost / Unit
                </th>

                <th>
                  Total Cost
                </th>

                <th>
                  Source
                </th>

                <th>
                  Remarks
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {purchases.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="empty-state"
                  >
                    No bulk purchase records yet.
                  </td>

                </tr>

              ) : (

                purchases.map(p => {

                  const quantity =
                    Number(
                      p.quantityPurchased || 0
                    );

                  const total =
                    Number(
                      p.totalCost || 0
                    );

                  const unitCost =
                    quantity > 0
                      ? total / quantity
                      : 0;

                  return (

                    <tr
                      key={p.id}
                    >

                      <td>
                        {p.purchaseDate}
                      </td>

                      <td>
                        {quantity.toFixed(2)}
                        {' '}units
                      </td>

                      <td>
                        ₹{unitCost.toFixed(2)}
                      </td>

                      <td>

                        <strong>
                          ₹{total.toFixed(2)}
                        </strong>

                      </td>

                      <td>
                        {p.supplierName || 'Admin'}
                      </td>

                      <td>
                        {p.remarks || '-'}
                      </td>

                      <td>

                        <button
                          className="btn-sm btn-approve"
                          onClick={() =>
                            handleEdit(p)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn-sm btn-reject"
                          style={{
                            marginLeft: 8
                          }}
                          onClick={() =>
                            handleDelete(
                              p.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}