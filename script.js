/* =========================================================
   CLOUDCOMPLAIN
   Cloud-Based Complaint Management System
   Main JavaScript File
========================================================= */


/* =========================================================
   1. LOCAL STORAGE KEYS
========================================================= */

const COMPLAINTS_KEY = "cloudcomplain_complaints";
const NOTIFICATIONS_KEY = "cloudcomplain_notifications";
const PROFILE_KEY = "cloudcomplain_profile";
const SELECTED_CATEGORY_KEY = "cloudcomplain_selected_category";


/* =========================================================
   2. DEFAULT PROFILE
========================================================= */

const DEFAULT_PROFILE = {
    name: "Dhilip Kumar",
    email: "dhilip@example.com",
    phone: "+91 98765 43210",
    department: "Computer Science",
    role: "Student"
};


/* =========================================================
   3. DEFAULT DATA
========================================================= */

function getComplaints() {

    try {

        const data = localStorage.getItem(COMPLAINTS_KEY);

        if (!data) {
            return [];
        }

        const complaints = JSON.parse(data);

        return Array.isArray(complaints) ? complaints : [];

    } catch (error) {

        console.error("Unable to load complaints:", error);

        return [];

    }
}


function saveComplaints(complaints) {

    localStorage.setItem(
        COMPLAINTS_KEY,
        JSON.stringify(complaints)
    );

}


function getNotifications() {

    try {

        const data = localStorage.getItem(NOTIFICATIONS_KEY);

        if (!data) {
            return [];
        }

        const notifications = JSON.parse(data);

        return Array.isArray(notifications)
            ? notifications
            : [];

    } catch (error) {

        console.error("Unable to load notifications:", error);

        return [];

    }
}


function saveNotifications(notifications) {

    localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(notifications)
    );

}


/* =========================================================
   4. COMPLAINT ID GENERATOR
========================================================= */

function generateComplaintId() {

    const now = new Date();

    const year = now.getFullYear();

    const randomNumber =
        Math.floor(1000 + Math.random() * 9000);

    return "CC-" + year + "-" + randomNumber;

}


/* =========================================================
   5. CREATE COMPLAINT
========================================================= */

function createComplaint(data) {

    const complaints = getComplaints();

    const complaint = {

        id: generateComplaintId(),

        title: data.title || "Untitled Complaint",

        category: data.category || "Other",

        priority: data.priority || "Medium",

        location: data.location || "Not specified",

        description:
            data.description ||
            "No description provided.",

        status: "Pending",

        progress: 25,

        submittedBy:
            getProfile().name,

        email:
            getProfile().email,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    complaints.unshift(complaint);

    saveComplaints(complaints);


    addNotification({

        type: "success",

        title: "Complaint Submitted",

        message:
            "Your complaint \"" +
            complaint.title +
            "\" has been submitted successfully.",

        complaintId:
            complaint.id

    });


    return complaint;

}


/* =========================================================
   6. FIND COMPLAINT
========================================================= */

function findComplaint(id) {

    if (!id) {
        return null;
    }

    const complaints = getComplaints();

    const searchId =
        id.trim().toLowerCase();

    return complaints.find(function (complaint) {

        return String(complaint.id)
            .toLowerCase() === searchId;

    }) || null;

}


/* =========================================================
   7. DELETE COMPLAINT
========================================================= */

function deleteComplaint(id) {

    const complaints = getComplaints();

    const complaint =
        findComplaint(id);

    if (!complaint) {

        showToast(
            "Complaint not found.",
            "error"
        );

        return false;

    }


    const updatedComplaints =
        complaints.filter(function (item) {

            return item.id !== id;

        });


    saveComplaints(updatedComplaints);


    addNotification({

        type: "info",

        title: "Complaint Deleted",

        message:
            "Complaint " +
            id +
            " was removed from your complaint list.",

        complaintId:
            id

    });


    updateStatistics();

    updateNotificationCount();


    const currentList =
        document.getElementById("complaintsList");

    if (currentList) {

        displayComplaints(
            getComplaints()
        );

    }


    showToast(
        "Complaint deleted successfully.",
        "success"
    );


    return true;

}


/* =========================================================
   8. UPDATE COMPLAINT STATUS
========================================================= */

function updateComplaintStatus(
    id,
    status
) {

    const complaints =
        getComplaints();

    const index =
        complaints.findIndex(function (complaint) {

            return complaint.id === id;

        });


    if (index === -1) {

        return false;

    }


    let progress = 25;


    if (status === "Pending") {

        progress = 25;

    } else if (status === "In Progress") {

        progress = 60;

    } else if (status === "Resolved") {

        progress = 100;

    } else if (status === "Rejected") {

        progress = 100;

    }


    complaints[index].status =
        status;

    complaints[index].progress =
        progress;

    complaints[index].updatedAt =
        new Date().toISOString();


    saveComplaints(complaints);


    addNotification({

        type:
            status === "Resolved"
                ? "success"
                : "info",

        title:
            "Complaint Status Updated",

        message:
            "Complaint " +
            id +
            " is now " +
            status +
            ".",

        complaintId:
            id

    });


    updateStatistics();

    updateNotificationCount();


    return true;

}


/* =========================================================
   9. STATISTICS
========================================================= */

function getComplaintStatistics() {

    const complaints =
        getComplaints();


    return {

        total:
            complaints.length,

        pending:
            complaints.filter(function (item) {

                return item.status === "Pending";

            }).length,

        progress:
            complaints.filter(function (item) {

                return item.status === "In Progress";

            }).length,

        resolved:
            complaints.filter(function (item) {

                return item.status === "Resolved";

            }).length,

        rejected:
            complaints.filter(function (item) {

                return item.status === "Rejected";

            }).length

    };

}


/* =========================================================
   10. UPDATE DASHBOARD STATISTICS
========================================================= */

function updateStatistics() {

    const stats =
        getComplaintStatistics();


    const total =
        document.getElementById(
            "totalComplaints"
        );

    const pending =
        document.getElementById(
            "pendingComplaints"
        );

    const progress =
        document.getElementById(
            "progressComplaints"
        );

    const resolved =
        document.getElementById(
            "resolvedComplaints"
        );


    if (total) {

        total.textContent =
            stats.total;

    }


    if (pending) {

        pending.textContent =
            stats.pending;

    }


    if (progress) {

        progress.textContent =
            stats.progress;

    }


    if (resolved) {

        resolved.textContent =
            stats.resolved;

    }


    updateRecentComplaints();

}


/* =========================================================
   11. DISPLAY COMPLAINTS
========================================================= */

function displayComplaints(
    complaints
) {

    const container =
        document.getElementById(
            "complaintsList"
        ) ||
        document.getElementById(
            "complaintList"
        );


    if (!container) {

        return;

    }


    if (!Array.isArray(complaints)) {

        complaints =
            getComplaints();

    }


    if (complaints.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📭
                </div>

                <h3>
                    No complaints found
                </h3>

                <p>
                    You have not submitted any
                    complaints yet.
                </p>

                <a
                    href="submit.html"
                    class="primary-button"
                >
                    ➕ Submit Complaint
                </a>

            </div>

        `;

        updateComplaintCount();

        return;

    }


    container.innerHTML =
        complaints.map(function (complaint) {

            return `

                <article
                    class="complaint-card"
                    data-id="${escapeHTML(complaint.id)}"
                >

                    <div class="complaint-card-header">

                        <div>

                            <h3 class="complaint-card-title">
                                ${escapeHTML(
                                    complaint.title
                                )}
                            </h3>

                            <div class="complaint-card-id">
                                ID:
                                ${escapeHTML(
                                    complaint.id
                                )}
                            </div>

                        </div>

                        <span
                            class="status-badge ${getStatusClass(
                                complaint.status
                            )}"
                        >
                            ${escapeHTML(
                                complaint.status
                            )}
                        </span>

                    </div>


                    <p class="complaint-card-description">

                        ${escapeHTML(
                            complaint.description
                        )}

                    </p>


                    <div class="complaint-card-meta">

                        <span>
                            📁
                            ${escapeHTML(
                                complaint.category
                            )}
                        </span>

                        <span>
                            📍
                            ${escapeHTML(
                                complaint.location
                            )}
                        </span>

                        <span>
                            ⚡
                            ${escapeHTML(
                                complaint.priority
                            )}
                        </span>

                        <span>
                            📅
                            ${formatDate(
                                complaint.createdAt
                            )}
                        </span>

                    </div>


                    <div class="complaint-card-actions">

                        <button
                            type="button"
                            onclick="viewComplaint('${escapeHTML(
                                complaint.id
                            )}')"
                        >
                            👁 View
                        </button>

                        <button
                            type="button"
                            onclick="trackComplaint('${escapeHTML(
                                complaint.id
                            )}')"
                        >
                            🔎 Track
                        </button>

                        <button
                            type="button"
                            onclick="confirmDeleteComplaint('${escapeHTML(
                                complaint.id
                            )}')"
                        >
                            🗑 Delete
                        </button>

                    </div>

                </article>

            `;

        }).join("");


    updateComplaintCount();

}


/* =========================================================
   12. UPDATE COMPLAINT COUNT
========================================================= */

function updateComplaintCount() {

    const countElement =
        document.getElementById(
            "complaintCount"
        );


    if (!countElement) {

        return;

    }


    const visibleCards =
        document.querySelectorAll(
            "#complaintsList .complaint-card"
        );


    countElement.textContent =
        visibleCards.length +
        (
            visibleCards.length === 1
                ? " complaint"
                : " complaints"
        );

}


/* =========================================================
   13. UPDATE RECENT COMPLAINTS
========================================================= */

function updateRecentComplaints() {

    const container =
        document.getElementById(
            "recentComplaints"
        );


    if (!container) {

        return;

    }


    const complaints =
        getComplaints().slice(0, 5);


    if (complaints.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📭
                </div>

                <h3>
                    No complaints yet
                </h3>

                <p>
                    Your recently submitted
                    complaints will appear here.
                </p>

                <a
                    href="submit.html"
                    class="primary-button"
                >
                    ➕ Submit Complaint
                </a>

            </div>

        `;

        return;

    }


    container.innerHTML =
        complaints.map(function (complaint) {

            return `

                <div
                    class="complaint-card"
                >

                    <div
                        class="complaint-card-header"
                    >

                        <div>

                            <h3
                                class="complaint-card-title"
                            >
                                ${escapeHTML(
                                    complaint.title
                                )}
                            </h3>

                            <div
                                class="complaint-card-id"
                            >
                                ${escapeHTML(
                                    complaint.id
                                )}
                            </div>

                        </div>

                        <span
                            class="status-badge ${getStatusClass(
                                complaint.status
                            )}"
                        >
                            ${escapeHTML(
                                complaint.status
                            )}
                        </span>

                    </div>

                    <div
                        class="complaint-card-meta"
                    >

                        <span>
                            📁
                            ${escapeHTML(
                                complaint.category
                            )}
                        </span>

                        <span>
                            📅
                            ${formatDate(
                                complaint.createdAt
                            )}
                        </span>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   14. VIEW COMPLAINT
========================================================= */

function viewComplaint(id) {

    const complaint =
        findComplaint(id);


    if (!complaint) {

        showToast(
            "Complaint not found.",
            "error"
        );

        return;

    }


    const message =

        "Complaint Details\n\n" +

        "ID: " +
        complaint.id +

        "\nTitle: " +
        complaint.title +

        "\nCategory: " +
        complaint.category +

        "\nPriority: " +
        complaint.priority +

        "\nStatus: " +
        complaint.status +

        "\nLocation: " +
        complaint.location +

        "\n\nDescription:\n" +
        complaint.description;


    alert(message);

}


/* =========================================================
   15. SEARCH COMPLAINTS
========================================================= */

function searchComplaints(query) {

    const complaints =
        getComplaints();


    if (!query || !query.trim()) {

        return complaints;

    }


    const search =
        query.trim().toLowerCase();


    return complaints.filter(
        function (complaint) {

            return (

                String(complaint.id)
                    .toLowerCase()
                    .includes(search)

                ||

                String(complaint.title)
                    .toLowerCase()
                    .includes(search)

                ||

                String(complaint.category)
                    .toLowerCase()
                    .includes(search)

                ||

                String(complaint.description)
                    .toLowerCase()
                    .includes(search)

                ||

                String(complaint.location)
                    .toLowerCase()
                    .includes(search)

            );

        }
    );

}


/* =========================================================
   16. FILTER COMPLAINTS
========================================================= */

function filterComplaints(
    search,
    status,
    category
) {

    let complaints =
        getComplaints();


    if (search && search.trim()) {

        const query =
            search.trim().toLowerCase();

        complaints =
            complaints.filter(
                function (complaint) {

                    return (

                        String(complaint.id)
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(complaint.title)
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(complaint.description)
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(complaint.location)
                            .toLowerCase()
                            .includes(query)

                    );

                }
            );

    }


    if (
        status &&
        status !== "all"
    ) {

        complaints =
            complaints.filter(
                function (complaint) {

                    return complaint.status === status;

                }
            );

    }


    if (
        category &&
        category !== "all"
    ) {

        complaints =
            complaints.filter(
                function (complaint) {

                    return complaint.category === category;

                }
            );

    }


    return complaints;

}


/* =========================================================
   17. STATUS CLASS
========================================================= */

function getStatusClass(status) {

    if (status === "Pending") {

        return "status-pending";

    }


    if (status === "In Progress") {

        return "status-in-progress";

    }


    if (status === "Resolved") {

        return "status-resolved";

    }


    if (status === "Rejected") {

        return "status-rejected";

    }


    return "status-pending";

}


/* =========================================================
   18. DATE FORMAT
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "Not available";

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return "Not available";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   19. PROFILE
========================================================= */

function getProfile() {

    try {

        const data =
            localStorage.getItem(
                PROFILE_KEY
            );


        if (!data) {

            return {
                ...DEFAULT_PROFILE
            };

        }


        const profile =
            JSON.parse(data);


        return {
            ...DEFAULT_PROFILE,
            ...profile
        };

    } catch (error) {

        console.error(
            "Unable to load profile:",
            error
        );

        return {
            ...DEFAULT_PROFILE
        };

    }

}


function saveProfile(profile) {

    const updatedProfile = {

        ...DEFAULT_PROFILE,

        ...profile

    };


    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(updatedProfile)
    );


    updateUserDisplay();


    return updatedProfile;

}


/* =========================================================
   20. UPDATE USER DISPLAY
========================================================= */

function updateUserDisplay() {

    const profile =
        getProfile();


    const userName =
        document.getElementById(
            "headerUserName"
        );


    if (userName) {

        userName.textContent =
            profile.name;

    }


    document
        .querySelectorAll(
            ".user-mini-info strong"
        )
        .forEach(function (element) {

            element.textContent =
                profile.name;

        });


    document
        .querySelectorAll(
            ".user-avatar"
        )
        .forEach(function (element) {

            element.textContent =
                getInitials(profile.name);

        });


    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    const profilePhone =
        document.getElementById(
            "profilePhone"
        );

    const profileDepartment =
        document.getElementById(
            "profileDepartment"
        );

    const profileRole =
        document.getElementById(
            "profileRole"
        );


    if (profileName) {

        profileName.value =
            profile.name;

    }


    if (profileEmail) {

        profileEmail.value =
            profile.email;

    }


    if (profilePhone) {

        profilePhone.value =
            profile.phone;

    }


    if (profileDepartment) {

        profileDepartment.value =
            profile.department;

    }


    if (profileRole) {

        profileRole.value =
            profile.role;

    }


    const largeAvatar =
        document.querySelector(
            ".large-profile-avatar"
        );


    if (largeAvatar) {

        largeAvatar.textContent =
            getInitials(profile.name);

    }


    const profileTitle =
        document.querySelector(
            ".profile-intro h2"
        );


    if (profileTitle) {

        profileTitle.textContent =
            profile.name;

    }

}


/* =========================================================
   21. INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "U";

    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   22. NOTIFICATIONS
========================================================= */

function addNotification(data) {

    const notifications =
        getNotifications();


    const notification = {

        id:
            "NT-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            ),

        type:
            data.type || "info",

        title:
            data.title || "Notification",

        message:
            data.message || "",

        complaintId:
            data.complaintId || "",

        read:
            false,

        createdAt:
            new Date().toISOString()

    };


    notifications.unshift(
        notification
    );


    saveNotifications(
        notifications
    );


    updateNotificationCount();


    return notification;

}


/* =========================================================
   23. UPDATE NOTIFICATION COUNT
========================================================= */

function updateNotificationCount() {

    const notifications =
        getNotifications();


    const unreadCount =
        notifications.filter(
            function (notification) {

                return !notification.read;

            }
        ).length;


    document
        .querySelectorAll(
            ".notification-count"
        )
        .forEach(function (element) {

            if (unreadCount > 0) {

                element.textContent =
                    unreadCount;

                element.style.display =
                    "inline-flex";

            } else {

                element.textContent =
                    "";

                element.style.display =
                    "none";

            }

        });


    const headerCount =
        document.getElementById(
            "headerNotificationCount"
        );


    if (headerCount) {

        headerCount.textContent =
            unreadCount > 0
                ? unreadCount
                : "";

    }


    const notificationSummary =
        document.getElementById(
            "unreadNotificationCount"
        );


    if (notificationSummary) {

        notificationSummary.textContent =
            unreadCount;

    }

}


/* =========================================================
   24. DISPLAY NOTIFICATIONS
========================================================= */

function displayNotifications() {

    const container =
        document.getElementById(
            "notificationList"
        );


    if (!container) {

        return;

    }


    const notifications =
        getNotifications();


    const unreadCount =
        notifications.filter(
            function (item) {

                return !item.read;

            }
        ).length;


    const summary =
        document.getElementById(
            "unreadNotificationCount"
        );


    if (summary) {

        summary.textContent =
            unreadCount;

    }


    if (notifications.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔔
                </div>

                <h3>
                    No notifications
                </h3>

                <p>
                    You are all caught up.
                    New complaint updates will
                    appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        notifications.map(
            function (notification) {

                let icon = "🔔";


                if (notification.type === "success") {

                    icon = "✅";

                } else if (
                    notification.type === "error"
                ) {

                    icon = "❌";

                } else if (
                    notification.type === "warning"
                ) {

                    icon = "⚠️";

                }


                return `

                    <div
                        class="notification-card ${
                            notification.read
                                ? ""
                                : "unread"
                        }"
                    >

                        <div
                            class="notification-icon"
                        >
                            ${icon}
                        </div>


                        <div
                            class="notification-content"
                        >

                            <div
                                class="notification-content-top"
                            >

                                <h3>
                                    ${escapeHTML(
                                        notification.title
                                    )}
                                </h3>

                                ${
                                    !notification.read
                                        ? `
                                            <span
                                                class="unread-dot"
                                            ></span>
                                        `
                                        : ""
                                }

                            </div>


                            ${
                                notification.complaintId
                                    ? `
                                        <span
                                            class="notification-complaint-id"
                                        >
                                            ${escapeHTML(
                                                notification.complaintId
                                            )}
                                        </span>
                                    `
                                    : ""
                            }


                            <p>
                                ${escapeHTML(
                                    notification.message
                                )}
                            </p>


                            <small>
                                ${formatDateTime(
                                    notification.createdAt
                                )}
                            </small>

                        </div>


                        <div
                            class="notification-card-actions"
                        >

                            ${
                                notification.read
                                    ? `
                                        <span
                                            class="read-label"
                                        >
                                            ✓ Read
                                        </span>
                                    `
                                    : `
                                        <button
                                            class="notification-read-button"
                                            type="button"
                                            onclick="markNotificationRead('${escapeHTML(
                                                notification.id
                                            )}')"
                                        >
                                            Mark Read
                                        </button>
                                    `
                            }

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   25. MARK NOTIFICATION READ
========================================================= */

function markNotificationRead(id) {

    const notifications =
        getNotifications();


    const index =
        notifications.findIndex(
            function (notification) {

                return notification.id === id;

            }
        );


    if (index === -1) {

        return;

    }


    notifications[index].read =
        true;


    saveNotifications(
        notifications
    );


    displayNotifications();

    updateNotificationCount();

}


/* =========================================================
   26. MARK ALL NOTIFICATIONS READ
========================================================= */

function markAllNotificationsRead() {

    const notifications =
        getNotifications();


    if (notifications.length === 0) {

        showToast(
            "No notifications to update.",
            "info"
        );

        return;

    }


    notifications.forEach(
        function (notification) {

            notification.read = true;

        }
    );


    saveNotifications(
        notifications
    );


    displayNotifications();

    updateNotificationCount();


    showToast(
        "All notifications marked as read.",
        "success"
    );

}


/* =========================================================
   27. CLEAR NOTIFICATIONS
========================================================= */

function clearNotifications() {

    const notifications =
        getNotifications();


    if (notifications.length === 0) {

        showToast(
            "There are no notifications to clear.",
            "info"
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to clear all notifications?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        NOTIFICATIONS_KEY
    );


    displayNotifications();

    updateNotificationCount();


    showToast(
        "Notifications cleared.",
        "success"
    );

}


/* =========================================================
   28. DATE + TIME FORMAT
========================================================= */

function formatDateTime(dateValue) {

    if (!dateValue) {

        return "Not available";

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return "Not available";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   29. CATEGORY SELECTION
========================================================= */

function selectComplaintCategory(
    category
) {

    if (!category) {

        return;

    }


    localStorage.setItem(
        SELECTED_CATEGORY_KEY,
        category
    );


    window.location.href =
        "submit.html";

}


function selectCategory(category) {

    selectComplaintCategory(
        category
    );

}


function getSelectedCategory() {

    return localStorage.getItem(
        SELECTED_CATEGORY_KEY
    ) || "";

}


function clearSelectedCategory() {

    localStorage.removeItem(
        SELECTED_CATEGORY_KEY
    );

}


/* =========================================================
   30. TOAST MESSAGE
========================================================= */

function showToast(
    message,
    type = "info"
) {

    let toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "toast";

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.remove(
        "success",
        "error",
        "warning",
        "info"
    );


    toast.classList.add(
        type
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.cloudComplainToastTimer
    );


    window.cloudComplainToastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   31. CONFIRM DELETE
========================================================= */

function confirmDeleteComplaint(
    id
) {

    const complaint =
        findComplaint(id);


    if (!complaint) {

        showToast(
            "Complaint not found.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete complaint \"" +
            complaint.title +
            "\"?\n\nThis action cannot be undone."
        );


    if (confirmed) {

        deleteComplaint(id);

    }

}


/* =========================================================
   32. TRACK COMPLAINT
========================================================= */

function trackComplaint(id) {

    let complaintId =
        id || "";


    if (!complaintId) {

        const input =
            document.getElementById(
                "complaintId"
            );


        if (input) {

            complaintId =
                input.value.trim();

        }

    }


    if (!complaintId) {

        showToast(
            "Please enter a complaint ID.",
            "error"
        );

        return;

    }


    const target =
        "track.html?id=" +
        encodeURIComponent(
            complaintId
        );


    if (
        window.location.pathname
            .toLowerCase()
            .endsWith("track.html")
    ) {

        const input =
            document.getElementById(
                "complaintId"
            );


        if (input) {

            input.value =
                complaintId;

        }


        if (
            typeof window.performTracking ===
            "function"
        ) {

            window.performTracking(
                complaintId
            );

        } else {

            window.location.href =
                target;

        }

    } else {

        window.location.href =
            target;

    }

}


/* =========================================================
   33. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   34. SUBMIT COMPLAINT FORM
========================================================= */

function setupComplaintForm() {

    const form =
        document.getElementById(
            "complaintForm"
        ) ||
        document.querySelector(
            "form[data-complaint-form]"
        );


    if (!form) {

        return;

    }


    const titleInput =
        document.getElementById(
            "title"
        ) ||
        document.getElementById(
            "complaintTitle"
        );


    const categoryInput =
        document.getElementById(
            "category"
        ) ||
        document.getElementById(
            "complaintCategory"
        );


    const priorityInput =
        document.getElementById(
            "priority"
        ) ||
        document.getElementById(
            "complaintPriority"
        );


    const locationInput =
        document.getElementById(
            "location"
        ) ||
        document.getElementById(
            "complaintLocation"
        );


    const descriptionInput =
        document.getElementById(
            "description"
        ) ||
        document.getElementById(
            "complaintDescription"
        );


    const selectedCategory =
        getSelectedCategory();


    if (
        categoryInput &&
        selectedCategory
    ) {

        const categoryExists =
            Array.from(
                categoryInput.options || []
            ).some(function (option) {

                return option.value ===
                    selectedCategory;

            });


        if (categoryExists) {

            categoryInput.value =
                selectedCategory;

        }

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const title =
                titleInput
                    ? titleInput.value.trim()
                    : "";


            const category =
                categoryInput
                    ? categoryInput.value
                    : "";


            const priority =
                priorityInput
                    ? priorityInput.value
                    : "Medium";


            const location =
                locationInput
                    ? locationInput.value.trim()
                    : "";


            const description =
                descriptionInput
                    ? descriptionInput.value.trim()
                    : "";


            if (!title) {

                showToast(
                    "Please enter a complaint title.",
                    "error"
                );

                if (titleInput) {

                    titleInput.focus();

                }

                return;

            }


            if (!category) {

                showToast(
                    "Please select a category.",
                    "error"
                );

                if (categoryInput) {

                    categoryInput.focus();

                }

                return;

            }


            if (!location) {

                showToast(
                    "Please enter the location.",
                    "error"
                );

                if (locationInput) {

                    locationInput.focus();

                }

                return;

            }


            if (description.length < 10) {

                showToast(
                    "Description must contain at least 10 characters.",
                    "error"
                );

                if (descriptionInput) {

                    descriptionInput.focus();

                }

                return;

            }


            if (description.length > 1000) {

                showToast(
                    "Description cannot exceed 1000 characters.",
                    "error"
                );

                return;

            }


            const complaint =
                createComplaint({

                    title:
                        title,

                    category:
                        category,

                    priority:
                        priority,

                    location:
                        location,

                    description:
                        description

                });


            clearSelectedCategory();


            form.reset();


            const characterCount =
                document.getElementById(
                    "characterCount"
                );


            if (characterCount) {

                characterCount.textContent =
                    "0 / 1000";

            }


            showToast(
                "Complaint " +
                complaint.id +
                " submitted successfully!",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "complaints.html";

                },
                900
            );

        }
    );

}


/* =========================================================
   35. MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        !menuButton ||
        !sidebar
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    sidebar.classList.remove(
                        "open"
                    );

                }
            );

        });

}


/* =========================================================
   36. ACTIVE SIDEBAR
========================================================= */

function setupActiveSidebar() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const links =
        document.querySelectorAll(
            ".nav-link"
        );


    links.forEach(function (link) {

        const href =
            link.getAttribute(
                "href"
            );


        if (!href) {

            return;

        }


        const linkPage =
            href
                .split("/")
                .pop()
                .toLowerCase();


        if (
            linkPage ===
            currentPage
        ) {

            link.classList.add(
                "active"
            );

        } else {

            link.classList.remove(
                "active"
            );

        }

    });

}


/* =========================================================
   37. SUBMIT BUTTON HELPERS
========================================================= */

function setupSubmitButtons() {

    const clearButton =
        document.getElementById(
            "clearFormButton"
        );


    const form =
        document.getElementById(
            "complaintForm"
        );


    if (
        clearButton &&
        form
    ) {

        clearButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Clear all entered complaint details?"
                    );


                if (!confirmed) {

                    return;

                }


                form.reset();

                clearSelectedCategory();


                const characterCount =
                    document.getElementById(
                        "characterCount"
                    );


                if (characterCount) {

                    characterCount.textContent =
                        "0 / 1000";

                }


                showToast(
                    "Form cleared.",
                    "info"
                );

            }
        );

    }


    const description =
        document.getElementById(
            "description"
        );


    const characterCount =
        document.getElementById(
            "characterCount"
        );


    if (
        description &&
        characterCount
    ) {

        function updateCharacterCount() {

            characterCount.textContent =
                description.value.length +
                " / 1000";


            if (
                description.value.length >
                1000
            ) {

                characterCount.style.color =
                    "#dc2626";

            } else {

                characterCount.style.color =
                    "";

            }

        }


        description.addEventListener(
            "input",
            updateCharacterCount
        );


        updateCharacterCount();

    }

}


/* =========================================================
   38. PROFILE FORM
========================================================= */

function setupProfileForm() {

    const form =
        document.getElementById(
            "profileForm"
        );


    if (!form) {

        return;

    }


    updateUserDisplay();


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "profileName"
                )?.value.trim();


            const email =
                document.getElementById(
                    "profileEmail"
                )?.value.trim();


            const phone =
                document.getElementById(
                    "profilePhone"
                )?.value.trim();


            const department =
                document.getElementById(
                    "profileDepartment"
                )?.value.trim();


            const role =
                document.getElementById(
                    "profileRole"
                )?.value.trim();


            if (!name) {

                showToast(
                    "Please enter your name.",
                    "error"
                );

                return;

            }


            if (!email) {

                showToast(
                    "Please enter your email.",
                    "error"
                );

                return;

            }


            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(email)
            ) {

                showToast(
                    "Please enter a valid email address.",
                    "error"
                );

                return;

            }


            saveProfile({

                name:
                    name,

                email:
                    email,

                phone:
                    phone || "",

                department:
                    department || "",

                role:
                    role || "Student"

            });


            addNotification({

                type:
                    "success",

                title:
                    "Profile Updated",

                message:
                    "Your profile information has been updated successfully."

            });


            updateNotificationCount();


            showToast(
                "Profile updated successfully.",
                "success"
            );

        }
    );


    const resetButton =
        document.getElementById(
            "resetProfileButton"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Reset profile to default information?"
                    );


                if (!confirmed) {

                    return;

                }


                saveProfile(
                    DEFAULT_PROFILE
                );


                showToast(
                    "Profile reset successfully.",
                    "success"
                );

            }
        );

    }

}


/* =========================================================
   39. NOTIFICATION PAGE SETUP
========================================================= */

function setupNotificationPage() {

    if (
        document.getElementById(
            "notificationList"
        )
    ) {

        displayNotifications();

        updateNotificationCount();

    }

}


/* =========================================================
   40. TRACK PAGE URL SUPPORT
========================================================= */

function setupTrackPage() {

    const input =
        document.getElementById(
            "complaintId"
        );


    if (!input) {

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (id) {

        input.value =
            id;

    }

}


/* =========================================================
   41. GLOBAL INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateStatistics();

        updateNotificationCount();

        updateUserDisplay();

        setupComplaintForm();

        setupMobileMenu();

        setupActiveSidebar();

        setupSubmitButtons();

        setupProfileForm();

        setupNotificationPage();

        setupTrackPage();

    }
);


/* =========================================================
   42. STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function () {

        updateStatistics();

        updateNotificationCount();

        updateUserDisplay();

        displayNotifications();

        const list =
            document.getElementById(
                "complaintsList"
            );


        if (list) {

            displayComplaints(
                getComplaints()
            );

        }

    }
);


/* =========================================================
   43. EXPORT FUNCTIONS TO WINDOW
========================================================= */

window.getComplaints =
    getComplaints;

window.saveComplaints =
    saveComplaints;

window.generateComplaintId =
    generateComplaintId;

window.createComplaint =
    createComplaint;

window.findComplaint =
    findComplaint;

window.deleteComplaint =
    deleteComplaint;

window.updateComplaintStatus =
    updateComplaintStatus;

window.getComplaintStatistics =
    getComplaintStatistics;

window.updateStatistics =
    updateStatistics;

window.displayComplaints =
    displayComplaints;

window.viewComplaint =
    viewComplaint;

window.searchComplaints =
    searchComplaints;

window.filterComplaints =
    filterComplaints;

window.getStatusClass =
    getStatusClass;

window.getProfile =
    getProfile;

window.saveProfile =
    saveProfile;

window.updateUserDisplay =
    updateUserDisplay;

window.getNotifications =
    getNotifications;

window.saveNotifications =
    saveNotifications;

window.addNotification =
    addNotification;

window.updateNotificationCount =
    updateNotificationCount;

window.displayNotifications =
    displayNotifications;

window.markNotificationRead =
    markNotificationRead;

window.markAllNotificationsRead =
    markAllNotificationsRead;

window.clearNotifications =
    clearNotifications;

window.selectComplaintCategory =
    selectComplaintCategory;

window.selectCategory =
    selectCategory;

window.getSelectedCategory =
    getSelectedCategory;

window.clearSelectedCategory =
    clearSelectedCategory;

window.showToast =
    showToast;

window.confirmDeleteComplaint =
    confirmDeleteComplaint;

window.trackComplaint =
    trackComplaint;

window.escapeHTML =
    escapeHTML;

window.formatDate =
    formatDate;

window.formatDateTime =
    formatDateTime;


/* =========================================================
   END OF CLOUDCOMPLAIN JAVASCRIPT
========================================================= */