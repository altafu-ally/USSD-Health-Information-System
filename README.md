# USSD Health Information System
> **Project Description:** The Smart Office and Public Digital Health Assistant.

---

## 🏛️ System Architecture

This system acts as a backend webhook that handles interactive text sessions initiated by users on any basic mobile phone:

```text
[ User Smartphone ] 
       │  (Dials *123#)
       ▼
[ Mobile Network Operator (MNO) Gateway / AfricasTalking ]
       │  (HTTP POST Request)
       ▼
[ Node.js Webhook Server ]
       │  (Decides Next Menu Step Based on User Session)
       ▼
[ Response returned as Plain Text (CON or END) ]
```

### 📲 USSD Session Protocol Definitions
*   **CON**: Keeps the communication channel open. Instructs the mobile device to display the text prompt and show an input field for the user to reply.
*   **END**: Closes the communication session. Instructs the mobile device to display the final text message and disconnect the call.

---

## 🔍 Project Overview

The **USSD Health Information System** is an accessible, text-based digital health solution designed to deliver critical medical services to users without relying on an internet connection or smartphone apps. By utilizing standard **USSD (Unstructured Supplementary Service Data)** technology, any basic feature phone can communicate with this system instantly via simple shortcodes (e.g., `*123#`).

This implementation is built as a highly responsive backend webhook engine using **Node.js** and **Express**, featuring a stateless layout optimized for low memory usage and high-capacity cellular networks.

### 🌟 Key Functionalities

*   **Automated Symptom Checker:** Guides users through an interactive triage structure to analyze symptoms (such as high fevers or persistent coughing) and safely routes localized medical advice.
*   **Geographic Clinic Locator:** Prompts users for their immediate region or town name, instantly matching them with nearby 24/7 public health facilities and referral centers.
*   **Public Health Broadcast System:** Serves as a lightweight announcement platform to deliver immediate alerts, vaccination schedules, and disease preventative practices to rural communities.

---

## ⚙️ Technical Architecture & Code Implementation Deep Dive

This application is a production-ready Node.js backend configured to serve as a webhook endpoint for telecommunication USSD gateways (such as Africa's Talking, Hubtel, or direct MNO connections). 

### 1. Request Handling & Parsing
The server listens for incoming HTTP `POST` requests on the `/ussd` route. Every interaction from the mobile telecom network forwards a JSON or URL-encoded payload containing four core string parameters:
*   `sessionId`: A unique identifier generated per active user session to persist call tracking.
*   `serviceCode`: The dedicated shortcode dialed by the user (e.g., `*123#`).
*   `phoneNumber`: The MSISDN string of the active mobile device.
*   `text`: A concatenated string reflecting the user's sequential inputs separated by asterisks (e.g., `1*2`).

### 2. Stateless Session Routing Algorithm
To circumvent complex memory footprints or continuous database querying overhead, the core logic implements a stateless array parsing strategy:
*   The script reads the incoming `text` string and transforms it using `.split('*')` into an array named `textArray`.
*   The index `textArray` acts as the root navigation flag, pinning down the user's main branch target (Symptom Checker, Clinic Locator, or Alerts).
*   The property `level` determines the immediate depth of the interactive tree traversal (`textArray.length`). This prevents state collisions when processing deeply nested sub-menus.

---

## 🚀 How to Run the Simulation
1. Clone this repository or download the source files.
2. Ensure you have Node.js installed on your workspace.
3. Run `npm install` inside your project directory to load dependencies.
4. Execute `npm start` to bring up your live endpoint webhook simulation.

---

## 📞 Contact Details
For inquiries, collaborations, or questions regarding this project, please feel free to reach out:

*   **Author:** Altafu Ally
*   **Email:** Altafuakalama@gmail.com
*   **Mobile Phone:** +255 683 218 814
