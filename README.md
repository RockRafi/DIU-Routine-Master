# DIU Routine Master

**Department of Computing and Information System (CIS)**  
**Daffodil International University (DIU)**

## Project Overview
The **DIU Routine Master** is a specialized web-based application developed to digitize and streamline the academic scheduling process for the CIS department. It replaces manual scheduling methods with an intelligent, conflict-aware system that manages class routines, resource allocation, and schedule distribution.

## Key Features

### 1. Public Schedule Portal
- **Student View**: Students can quickly find their weekly class routine by selecting their specific Section (e.g., Section A, Batch 56).
- **Teacher View**: Faculty members can filter the master schedule to see only their assigned classes.
- **PDF Export**: Users can generate a clean, print-friendly PDF of any selected routine with a single click.

### 2. Administrative Dashboard
- **Secure Access**: Protected via strict authentication (Username: `admin`, Password: `admin123`).
- **Resource Management**: Complete control to Add, Edit, or Remove:
  - **Teachers**: Manage faculty profiles and initials.
  - **Courses**: Update curriculum offerings, codes, and credits.
  - **Rooms**: Manage classroom and lab allocations with capacity tracking.
  - **Sections**: Organize student batches.
- **Visual Scheduler**: An intuitive interface to assign classes to specific time slots.

### 3. Smart Conflict Detection
The system includes a robust validation engine that prevents scheduling errors before they happen. It automatically checks for:
- **Teacher Conflicts**: Ensures a teacher is not assigned to two classes simultaneously.
- **Room Overlaps**: Prevents booking the same room for multiple sections at the same time.
- **Section Double-Booking**: Guarantees a student batch isn't expected to be in two places at once.

## Technical Specifications
- **Frontend Framework**: React.js (v19) with TypeScript
- **Styling**: Tailwind CSS for a modern, responsive user interface.
- **State Management**: Local persistence for data retention during the session.
- **Icons**: Lucide React.

## Access Credentials
For demonstration and administrative purposes:
- **Username**: `admin`
- **Password**: `admin123`

---
*Developed for the CIS Department, DIU.*
