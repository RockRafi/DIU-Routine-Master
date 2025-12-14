# DIU Routine Master

**Department of Computing and Information System (CIS)**  
**Daffodil International University (DIU)**

## Project Overview
The **DIU Routine Master** is a specialized web-based application developed to digitize and streamline the academic scheduling process for the CIS department. It replaces manual scheduling methods with an intelligent, conflict-aware system that manages class routines, resource allocation, and schedule distribution.

## Key Features

### 1. Public Schedule Portal
- **Student View**: Students can quickly find their weekly class routine by selecting their specific Section (e.g., Section A, Batch 56).
- **Teacher View**: Faculty members can filter the master schedule to see only their assigned classes.
- **PDF Export**: Users can generate a clean, print-friendly PDF of any selected routine with a single click via the browser's native print engine with custom print-specific CSS.

### 2. Administrative Dashboard
- **Secure Access**: Protected via client-side authentication (Username: `admin`, Password: `admin123`).
- **Resource Management**: Complete control to Add, Edit, or Remove:
  - **Teachers**: Manage faculty profiles, initials, off-days, and counseling hours.
  - **Courses**: Update curriculum offerings, codes, and credits.
  - **Rooms**: Manage classroom and lab allocations with type (Lab/Theory) distinction.
  - **Sections**: Organize student batches and section names.
- **Visual Scheduler**: An intuitive interface utilizing HTML5 Drag and Drop to assign and move classes across time slots.

### 3. Smart Conflict Detection
The system includes a robust validation engine that prevents scheduling errors before they happen. It automatically checks for:
- **Teacher Conflicts**: Ensures a teacher is not assigned to two classes simultaneously.
- **Room Overlaps**: Prevents booking the same room for multiple sections at the same time.
- **Section Double-Booking**: Guarantees a student batch isn't expected to be in two places at once.
- **Off-Day Constraints**: Alerts if a class is scheduled on a teacher's designated off-day.

## Technical Details

### Architecture & Stack
This is a **Single Page Application (SPA)** built entirely with modern frontend technologies. It operates client-side without a traditional backend database, ensuring speed and portability.

- **Frontend Framework**: [React.js v19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust type safety and interface definitions.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first, responsive design and print layout controls.
- **Icons**: [Lucide React](https://lucide.dev/) for consistent UI iconography.
- **Build/Runtime**: Standard ES Modules via browser import maps (no complex bundler configuration required for this demo environment).

### Data Management
- **Persistence**: Data is persisted using the browser's `localStorage` API. This allows the state (teachers, schedule, rooms) to remain available across page reloads without a server database.
- **Data Models** (`types.ts`):
  - `AppData`: The root state object containing all collections.
  - `ClassSession`: Represents a single scheduled class, linking `teacherId`, `courseId`, `roomId`, and `sectionId`.

### Core Functions & Services

#### 1. Conflict Detection Engine (`services/dbService.ts`)
The `checkConflict(newSession, data)` function is the heart of the system's logic. It iterates through the existing schedule to validate:
```typescript
// Pseudocode logic
if (existingSession.time === newSession.time) {
   if (existingSession.teacher === newSession.teacher) throw "Teacher Conflict";
   if (existingSession.room === newSession.room) throw "Room Occupied";
   if (existingSession.section === newSession.section) throw "Batch Busy";
}
```

#### 2. Drag and Drop Logic (`components/ScheduleGrid.tsx`)
Implements the native HTML5 Drag and Drop API:
- `draggable` attributes on session blocks.
- `onDragStart`: Captures the Session ID.
- `onDrop`: Transmits the Session ID to the target time slot/day.
- The parent component (`AdminDashboard`) handles the state update and conflict validation upon drop.

#### 3. Filtering & Views (`components/PublicView.tsx` & `ScheduleTable.tsx`)
Uses high-performance array filtering to derive views:
- **Batch Grouping**: Reduces the raw list of sections into intuitive Batch groups (e.g., "Batch 56" containing Section A and B).
- **Dynamic Filtering**: The `ScheduleTable` component accepts a `filterType` prop to render specific slices of the master schedule (by Teacher ID, Section ID, or Room ID) instantly.

## Access Credentials
For demonstration and administrative purposes:
- **Username**: `admin`
- **Password**: `admin123`

---
*Developed for the CIS Department, DIU.*