# Toddle Assignment Project — Aditya Kumar

## 📎 Project Details

- **URL**: [https://toddle-journal-4ei4.onrender.com/api](https://toddle-journal-4ei4.onrender.com/api)  
- **Database**: PostgreSQL hosted on **Render** (free tier, limited capacity)  
  - Note: Render’s free PostgreSQL tier may sleep after inactivity.
- **Database Resources**:  
  - `ER-data.txt` (Schema info)  
  - `ER-Diagram.png` (Also contained in the provided zip file)

---

## 📁 Repository and Deployment

> Although stated in the instructions *not to put the code on GitHub*, to deploy on Render this repo has been created as a **private repository** on my profile and then connected and deployed on Render.

---

## 👤 Existing Users (Password: `password123`)

- `liveteacher1` , `liveteacher2` 
- `livestudent1` , `livestudent2`

---

## 📓 Journal Data

- Journal IDs **1–14** have already been created and extensively manipulated for testing the live database.
- **Entity IDs** (journals, students, teachers) are integer-based and auto-incremented in order of creation.
  - Deletion does **not reset** the counter.

---

## ⚙️ Functionality

- CRUD operations + **Publish** operation are implemented for **Journals**.
- **Teachers and Students**:
  - Currently cannot be modified or deleted.
  - Functionality can be added later.

---

## 🧪 Postman Setup

- **Postman Environment and Collection** are included in the ZIP:
  - **Environment**: Contains variables required for testing.
  - **Collection**: Includes all necessary endpoint tests.
- Current test setup creates:
  - `liveteacher3`
  - `livestudent3`
- Request: **Upload Attachment**
  - Requires manual file attachment in request body.
- Feed: Student feed will be fetched for `livestudent1` as currently many posts tag that student since testing.
- Server & DB are **up and running**, all endpoints tested and functional.

---

## 📝 Postman Testing Notes

1. Start with **Teacher Register and Login** to set environment variables.
2. Perform **Create Journal** before others — subsequent requests rely on journal creation.
3. Journal operations use the `journalId` variable (auto-updated on journal creation).
4. After journal deletion, a **new journal** must be created for other requests to work properly.
5. Requests are **arranged in execution order** for proper functionality.

---

## 🛠️ Technical Notes

- This project is a complete **original creation from scratch**, with some AI assistant usage for code refinement and making sure to perform the task best to my ability with all available resources.
- Code is heavily commented for clarity and maintainability.
- Built with a **modular structure** — clearly separated components and folders.

---

## 📂 Folder and File Structure

Journal-App/

├── config/

├── controllers/

├── db/

│   ├── migrations/

│   ├── models/

│   └── sql/

├── middleware/

├── routes/

├── services/

├── uploads/

├── utils/

├── .env

├── app.js

├── server.js

├── package.json

├── Postman_collection.json

└── Postman_environment.json



---

## 📞 For any issue regarding the project or apis, please contact -

**Aditya Kumar**  
📱 7895085968  
📧 adityakumar.9c@gmail.com
