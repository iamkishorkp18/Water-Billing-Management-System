import { useEffect, useMemo, useState } from "react";
import api from "../../../Api/apiClient";

export default function NotificationsTab({ householdId: propHouseholdId }) {

  const [notifications, setNotifications] = useState([]);
  const [householdId, setHouseholdId] = useState(propHouseholdId || null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("resident_read_notifications") || "[]"
      );
    } catch {
      return [];
    }
  });


  // =========================================================
  // FIND HOUSEHOLD ID
  // =========================================================

  useEffect(() => {

    if (propHouseholdId) {
      setHouseholdId(propHouseholdId);
      return;
    }

    try {

      const possibleKeys = [
        "user",
        "currentUser",
        "loggedInUser",
        "resident",
        "authUser"
      ];

      let foundUser = null;

      for (const key of possibleKeys) {

        const value = localStorage.getItem(key);

        if (!value) continue;

        try {

          const parsed = JSON.parse(value);

          if (parsed) {
            foundUser = parsed;
            break;
          }

        } catch {
          // Ignore invalid JSON
        }
      }

      if (foundUser) {

        const id =
          foundUser.householdId ||
          foundUser.household?.id ||
          foundUser.household_id;

        if (id) {
          setHouseholdId(id);
        }

      }

    } catch (error) {
      console.error("Unable to find household ID:", error);
    }

  }, [propHouseholdId]);


  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  useEffect(() => {

    if (householdId) {
      loadNotifications();
    } else {
      setLoading(false);
    }

  }, [householdId]);


  const loadNotifications = async () => {

    try {

      setRefreshing(true);

      const response = await api.get(
        `/notifications/household/${householdId}`
      );

      setNotifications(response.data || []);

    } catch (error) {

      console.error(
        "Failed to load notifications:",
        error.response?.data || error
      );

      setNotifications([]);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  // =========================================================
  // SAVE READ IDS
  // =========================================================

  const saveReadIds = (ids) => {

    setReadIds(ids);

    localStorage.setItem(
      "resident_read_notifications",
      JSON.stringify(ids)
    );

  };


  // =========================================================
  // MARK AS READ
  // =========================================================

  const markAsRead = (id) => {

    if (!id) return;

    if (readIds.includes(id)) {
      return;
    }

    const updated = [...readIds, id];

    saveReadIds(updated);

  };


  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const markAllAsRead = () => {

    const allIds = notifications
      .map(notification => notification.id)
      .filter(Boolean);

    saveReadIds(allIds);

  };


  // =========================================================
  // OPEN NOTIFICATION
  // =========================================================

  const openNotification = (notification) => {

    setSelectedNotification(notification);

    markAsRead(notification.id);

  };


  // =========================================================
  // CLOSE POPUP
  // =========================================================

  const closeNotification = () => {

    setSelectedNotification(null);

  };


  // =========================================================
  // NOTIFICATION TYPE
  // =========================================================

  const getNotificationType = (notification) => {

    return (
      notification.notificationType ||
      notification.type ||
      "ANNOUNCEMENT"
    ).toUpperCase();

  };


  // =========================================================
  // ICON
  // =========================================================

  const getIcon = (type) => {

    switch (type) {

      case "BILLING":
        return "💳";

      case "MAINTENANCE":
        return "🔧";

      case "EMERGENCY":
        return "🚨";

      case "ANNOUNCEMENT":
        return "📢";

      default:
        return "🔔";
    }

  };


  // =========================================================
  // TYPE LABEL
  // =========================================================

  const getTypeLabel = (type) => {

    switch (type) {

      case "BILLING":
        return "Billing";

      case "MAINTENANCE":
        return "Maintenance";

      case "EMERGENCY":
        return "Emergency";

      case "ANNOUNCEMENT":
        return "Announcement";

      default:
        return "Notification";
    }

  };


  // =========================================================
  // TIME
  // =========================================================

  const getTimeText = (dateValue) => {

    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    const now = new Date();

    const diff =
      Math.floor(
        (now.getTime() - date.getTime()) /
        (1000 * 60 * 60 * 24)
      );

    if (diff === 0) {
      return "Today";
    }

    if (diff === 1) {
      return "Yesterday";
    }

    if (diff < 7) {
      return `${diff} days ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  };


  // =========================================================
  // FILTERED NOTIFICATIONS
  // =========================================================

  const filteredNotifications = useMemo(() => {

    let result = [...notifications];

    // Filter
    if (filter === "UNREAD") {

      result = result.filter(
        notification =>
          !readIds.includes(notification.id)
      );

    } else if (filter !== "ALL") {

      result = result.filter(
        notification =>
          getNotificationType(notification) === filter
      );

    }

    // Search
    if (search.trim()) {

      const query = search.toLowerCase();

      result = result.filter(notification => {

        const title =
          String(notification.title || "")
            .toLowerCase();

        const message =
          String(notification.message || "")
            .toLowerCase();

        const type =
          getNotificationType(notification)
            .toLowerCase();

        return (
          title.includes(query) ||
          message.includes(query) ||
          type.includes(query)
        );

      });

    }

    return result;

  }, [
    notifications,
    filter,
    search,
    readIds
  ]);


  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount = useMemo(() => {

    return notifications.filter(
      notification =>
        !readIds.includes(notification.id)
    ).length;

  }, [notifications, readIds]);


  // =========================================================
  // EMPTY HOUSEHOLD ID
  // =========================================================

  if (!householdId && !loading) {

    return (

      <div className="resident-notification-page">

        <div className="notification-empty-box">

          <div className="empty-icon">
            🔔
          </div>

          <h3>Notifications unavailable</h3>

          <p>
            Your household information could not be found.
          </p>

          <button
            className="notification-refresh-btn"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="resident-notification-page">

        <div className="notification-loading">

          <div className="notification-spinner"></div>

          <h3>Loading notifications...</h3>

          <p>
            Checking for new messages from your apartment admin.
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="resident-notification-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="resident-notification-header">

        <div className="notification-title-area">

          <div className="notification-main-icon">
            🔔
          </div>

          <div>

            <h2>
              Notifications
            </h2>

            <p>
              Stay updated with messages from your apartment
            </p>

          </div>

        </div>


        <div className="notification-header-actions">

          {unreadCount > 0 && (

            <div className="unread-badge">

              <span className="unread-dot"></span>

              {unreadCount} unread

            </div>

          )}

          <button
            className="notification-refresh-btn"
            onClick={loadNotifications}
            disabled={refreshing}
          >

            <span className={refreshing ? "refresh-spin" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}

          </button>

        </div>

      </div>


      {/* =====================================================
          TOP SUMMARY
      ===================================================== */}

      <div className="notification-summary">

        <div className="summary-card summary-total">

          <div className="summary-icon">
            📬
          </div>

          <div>

            <strong>
              {notifications.length}
            </strong>

            <span>
              Total notifications
            </span>

          </div>

        </div>


        <div className="summary-card summary-unread">

          <div className="summary-icon">
            🔵
          </div>

          <div>

            <strong>
              {unreadCount}
            </strong>

            <span>
              Unread notifications
            </span>

          </div>

        </div>


        <div className="summary-card summary-read">

          <div className="summary-icon">
            ✓
          </div>

          <div>

            <strong>
              {notifications.length - unreadCount}
            </strong>

            <span>
              Read notifications
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="notification-controls">

        <div className="notification-search">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>

          )}

        </div>


        <div className="notification-filter-buttons">

          <button
            className={
              filter === "ALL"
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() => setFilter("ALL")}
          >
            All
          </button>


          <button
            className={
              filter === "UNREAD"
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() => setFilter("UNREAD")}
          >
            Unread
          </button>


          <button
            className={
              filter === "ANNOUNCEMENT"
                ? "filter-btn active announcement-filter"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("ANNOUNCEMENT")
            }
          >
            📢 Announcements
          </button>


          <button
            className={
              filter === "MAINTENANCE"
                ? "filter-btn active maintenance-filter"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("MAINTENANCE")
            }
          >
            🔧 Maintenance
          </button>


          <button
            className={
              filter === "EMERGENCY"
                ? "filter-btn active emergency-filter"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("EMERGENCY")
            }
          >
            🚨 Emergency
          </button>


          <button
            className={
              filter === "BILLING"
                ? "filter-btn active billing-filter"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("BILLING")
            }
          >
            💳 Billing
          </button>

        </div>


        {unreadCount > 0 && (

          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            ✓ Mark all as read
          </button>

        )}

      </div>


      {/* =====================================================
          NOTIFICATION LIST
      ===================================================== */}

      <div className="notification-list">

        {filteredNotifications.length === 0 ? (

          <div className="notification-empty-box">

            <div className="empty-icon">
              {search || filter !== "ALL"
                ? "🔎"
                : "🎉"}
            </div>

            <h3>
              {search || filter !== "ALL"
                ? "No matching notifications"
                : "You're all caught up!"}
            </h3>

            <p>

              {search || filter !== "ALL"
                ? "Try changing your search or filter."
                : "There are no new notifications from your apartment admin."}

            </p>

            {(search || filter !== "ALL") && (

              <button
                className="notification-refresh-btn"
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                }}
              >
                Show all notifications
              </button>

            )}

          </div>

        ) : (

          filteredNotifications.map(
            (notification, index) => {

              const type =
                getNotificationType(notification);

              const isRead =
                readIds.includes(notification.id);

              return (

                <div
                  key={notification.id}
                  className={
                    isRead
                      ? "resident-notification-card read"
                      : "resident-notification-card unread"
                  }
                  style={{
                    animationDelay:
                      `${index * 70}ms`
                  }}
                  onClick={() =>
                    openNotification(notification)
                  }
                >


                  {/* Unread indicator */}

                  {!isRead && (
                    <div className="new-indicator">
                      NEW
                    </div>
                  )}


                  {/* Icon */}

                  <div
                    className={
                      `resident-notification-icon notification-${type.toLowerCase()}`
                    }
                  >
                    {getIcon(type)}
                  </div>


                  {/* Content */}

                  <div className="resident-notification-content">

                    <div className="notification-card-top">

                      <span
                        className={
                          `notification-type type-${type.toLowerCase()}`
                        }
                      >
                        {getTypeLabel(type)}
                      </span>

                      <span className="notification-time">
                        {getTimeText(
                          notification.createdDate
                        )}
                      </span>

                    </div>


                    <h3>
                      {notification.title}
                    </h3>


                    <p>
                      {notification.message}
                    </p>


                    <div className="notification-card-bottom">

                      <span className="notification-target">

                        {notification.householdId
                          ? "👤 Personal notification"
                          : "🏢 Apartment notification"}

                      </span>


                      <span className="open-notification">
                        {isRead
                          ? "Open notification →"
                          : "Read notification →"}
                      </span>

                    </div>

                  </div>


                  {/* Read status */}

                  <div
                    className={
                      isRead
                        ? "read-status read-status-done"
                        : "read-status"
                    }
                  >
                    {isRead ? "✓" : ""}
                  </div>

                </div>

              );

            }
          )

        )}

      </div>


      {/* =====================================================
          POPUP / DETAIL VIEW
      ===================================================== */}

      {selectedNotification && (

        <div
          className="notification-modal-overlay"
          onClick={closeNotification}
        >

          <div
            className="notification-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >


            <button
              className="notification-modal-close"
              onClick={closeNotification}
            >
              ×
            </button>


            <div
              className={
                `notification-modal-banner notification-${getNotificationType(
                  selectedNotification
                ).toLowerCase()}`
              }
            >

              <div className="modal-big-icon">

                {getIcon(
                  getNotificationType(
                    selectedNotification
                  )
                )}

              </div>

              <div>

                <span className="modal-small-title">
                  AquaLedger Notification
                </span>

                <h2>
                  {selectedNotification.title}
                </h2>

              </div>

            </div>


            <div className="notification-modal-body">

              <div className="modal-meta">

                <span
                  className={
                    `notification-type type-${getNotificationType(
                      selectedNotification
                    ).toLowerCase()}`
                  }
                >
                  {getTypeLabel(
                    getNotificationType(
                      selectedNotification
                    )
                  )}
                </span>

                <span>
                  {getTimeText(
                    selectedNotification.createdDate
                  )}
                </span>

              </div>


              <div className="modal-message">

                <p>
                  {selectedNotification.message}
                </p>

              </div>


              <div className="modal-info-box">

                <div>

                  <span>
                    Received
                  </span>

                  <strong>
                    {selectedNotification.createdDate ||
                      "Today"}
                  </strong>

                </div>


                <div>

                  <span>
                    Type
                  </span>

                  <strong>
                    {getTypeLabel(
                      getNotificationType(
                        selectedNotification
                      )
                    )}
                  </strong>

                </div>

              </div>


              <button
                className="modal-close-button"
                onClick={closeNotification}
              >
                Done
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}