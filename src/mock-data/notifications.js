// Mock notification data for Ganesh Mandal
const notifications = {
  history: [
    {
      id: "NTF-0001",
      userId: "GM-0001",
      eventId: "EVT-0001",
      notificationType: "Event Reminder",
      channel: "WhatsApp",
      receiver: "9823145678",
      message: "Reminder: Murti Sthapana ceremony tomorrow at 7 AM at Mandal Headquarters. Please arrive 30 minutes early.",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-08-25T18:00:00",
      createdAt: "2026-08-25T17:55:00"
    },
    {
      id: "NTF-0002",
      userId: "GM-0002",
      eventId: "EVT-0004",
      notificationType: "Event Announcement",
      channel: "SMS",
      receiver: "9822567890",
      message: "Dholshek Path procession on Day 2 (Aug 27) at 8 PM from Laxmi Road. Join us for this grand event!",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-08-26T10:00:00",
      createdAt: "2026-08-26T09:58:00"
    },
    {
      id: "NTF-0003",
      userId: "GM-0005",
      eventId: "EVT-0008",
      notificationType: "Event Reminder",
      channel: "WhatsApp",
      receiver: "7010635615",
      message: "Modak Competition starts tomorrow at 10 AM. Register at the mandal office. All are welcome!",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-08-28T19:00:00",
      createdAt: "2026-08-28T18:55:00"
    },
    {
      id: "NTF-0004",
      userId: "GM-0010",
      eventId: "",
      notificationType: "Donation Acknowledgment",
      channel: "Email",
      receiver: "smita.gadkari@gmail.com",
      message: "Thank you for your generous donation of Rs. 7,500 to Hindavi Swarajya Ganesh Mandal. Receipt REC-0048 has been generated.",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-08-20T14:30:00",
      createdAt: "2026-08-20T14:25:00"
    },
    {
      id: "NTF-0005",
      userId: "GM-0015",
      eventId: "EVT-0013",
      notificationType: "Event Announcement",
      channel: "WhatsApp",
      receiver: "7334133456",
      message: "Blood Donation Camp on Sept 2 at Mandal HQ from 9 AM to 6 PM. Free health checkup for all donors. Come be a hero!",
      status: "Failed",
      errorMessage: "WhatsApp API rate limit exceeded",
      sentTime: null,
      createdAt: "2026-08-31T08:00:00"
    },
    {
      id: "NTF-0006",
      userId: "GM-0020",
      eventId: "EVT-0011",
      notificationType: "Event Reminder",
      channel: "SMS",
      receiver: "7531734259",
      message: "Women's Day Celebration tomorrow at Sahitya Sahawas Hall from 4 PM. Mehendi and rangoli contests await you!",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-08-31T17:00:00",
      createdAt: "2026-08-31T16:55:00"
    },
    {
      id: "NTF-0007",
      userId: "GM-0025",
      eventId: "",
      notificationType: "Payment Reminder",
      channel: "WhatsApp",
      receiver: "7268703254",
      message: "Ganesh Mandal annual subscription reminder. Please pay Rs. 1,100 at your earliest convenience. UPI: hindavi@upi",
      status: "Pending",
      errorMessage: null,
      sentTime: null,
      createdAt: "2026-09-01T10:00:00"
    },
    {
      id: "NTF-0008",
      userId: "GM-0030",
      eventId: "EVT-0014",
      notificationType: "Event Announcement",
      channel: "Email",
      receiver: "satyam.goswami@gmail.com",
      message: "Community Dinner on Day 9 (Sept 3) at Mandal Open Ground from 7 PM. Traditional Maharashtrian cuisine. All members welcome.",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-09-02T12:00:00",
      createdAt: "2026-09-02T11:55:00"
    },
    {
      id: "NTF-0009",
      userId: "GM-0035",
      eventId: "EVT-0007",
      notificationType: "Event Reminder",
      channel: "WhatsApp",
      receiver: "8184538612",
      message: "Final Day - Ganesh Visarjan on Sept 5. Assembly at 6 AM. Bring eco-friendly materials. Let's celebrate responsibly!",
      status: "Sent",
      errorMessage: null,
      sentTime: "2026-09-04T18:00:00",
      createdAt: "2026-09-04T17:55:00"
    },
    {
      id: "NTF-0010",
      userId: "GM-0040",
      eventId: "",
      notificationType: "General Announcement",
      channel: "SMS",
      receiver: "7212363128",
      message: "Hindavi Swarajya Ganesh Mandal thanks all members for making Ganesh Festival 2026 a grand success. Ganpati Bappa Morya!",
      status: "Failed",
      errorMessage: "Invalid mobile number format",
      sentTime: null,
      createdAt: "2026-09-05T20:00:00"
    }
  ],

  templates: [
    {
      id: "TPL-0001",
      templateName: "Event Reminder",
      notificationType: "Event Reminder",
      whatsappTemplateId: "event_reminder_v1",
      emailSubject: "Reminder: {{eventName}} on {{eventDate}}",
      emailBody: "Dear {{memberName}},\n\nThis is a reminder about the upcoming event:\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nTime: {{eventTime}}\nVenue: {{venue}}\n\nPlease arrive on time. For queries, contact the mandal office.\n\nJai Hindavi Swarajya!\nGanesh Mandal Team",
      messageText: "Reminder: {{eventName}} on {{eventDate}} at {{venue}}. Time: {{eventTime}}. Please be present. - Hindavi Swarajya Ganesh Mandal",
      status: "Active"
    },
    {
      id: "TPL-0002",
      templateName: "Event Announcement",
      notificationType: "Event Announcement",
      whatsappTemplateId: "event_announce_v1",
      emailSubject: "New Event: {{eventName}}",
      emailBody: "Dear {{memberName}},\n\nWe are pleased to announce a new event:\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nTime: {{eventTime}}\nVenue: {{venue}}\n\n{{eventDescription}}\n\nPlease mark your calendar and join us.\n\nGanesh Mandal Team",
      messageText: "{{eventName}} on {{eventDate}} at {{venue}}. {{eventDescription}}. Join us! - Hindavi Swarajya Ganesh Mandal",
      status: "Active"
    },
    {
      id: "TPL-0003",
      templateName: "Payment Reminder",
      notificationType: "Payment Reminder",
      whatsappTemplateId: "payment_reminder_v1",
      emailSubject: "Payment Reminder - Annual Subscription",
      emailBody: "Dear {{memberName}},\n\nThis is a gentle reminder that your annual subscription of Rs. {{amount}} is pending.\n\nYou can pay via:\n- UPI: {{upiId}}\n- Cash: Visit mandal office\n- Bank Transfer: {{accountDetails}}\n\nThank you for your continued support.\n\nGanesh Mandal Team",
      messageText: "Annual subscription of Rs. {{amount}} is pending. Pay via UPI: {{upiId}} or visit mandal office. - Hindavi Swarajya Ganesh Mandal",
      status: "Active"
    },
    {
      id: "TPL-0004",
      templateName: "Donation Acknowledgment",
      notificationType: "Donation Acknowledgment",
      whatsappTemplateId: "donation_ack_v1",
      emailSubject: "Thank You for Your Donation - Receipt {{receiptNumber}}",
      emailBody: "Dear {{memberName}},\n\nThank you for your generous donation of Rs. {{amount}}.\n\nReceipt Number: {{receiptNumber}}\nPayment Mode: {{paymentMode}}\nDate: {{donationDate}}\n\nYour contribution helps us serve the community better.\n\nWith gratitude,\nHindavi Swarajya Ganesh Mandal",
      messageText: "Thank you for your donation of Rs. {{amount}}. Receipt {{receiptNumber}} generated. Jai Hindavi Swarajya! - Ganesh Mandal",
      status: "Active"
    }
  ],

  config: {
    whatsappEnabled: false,
    emailEnabled: false,
    senderName: "Hindavi Swarajya",
    senderEmail: "info@hindaviswarajya.org",
    senderWhatsapp: "919876543210",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    whatsappApiKey: "",
    whatsappApiUrl: ""
  }
};

export default notifications;
