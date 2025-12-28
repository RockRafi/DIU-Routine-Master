# DIU Routine Master v3.0

**Department of Computing and Information System (CIS)**  
**Daffodil International University (DIU)**

## Project Overview
The **DIU Routine Master** is a high-performance, responsive academic scheduling platform built for the DIU CIS department. It leverages modern frontend design principles to provide a seamless routine management experience for both students and administrators. Version 3.0 introduces a refined **Material 3 Flat Design** aesthetic and enhanced responsive capabilities.

## Core Features

### 1. Unified Academic Portal
- **Student Focus**: Intuitive selection of Batch/Section to retrieve personalized weekly routines.
- **Faculty View**: Real-time filtering of schedules by individual teacher initials to see specific teaching loads.
- **Smart Today Board**: A "Live Feed" component that instantly displays classes for the current day across the entire department.
- **Free Room Finder**: Dynamic resource tracking that shows vacant classrooms for any specific time slot.

### 2. High-Fidelity Administrative Console
- **Fixed-Rail Navigation**: A persistent side menu for rapid switching between schedule, faculty, course, and room management.
- **Drag-and-Drop Scheduler**: A desktop-first interactive board for assigning, moving, and updating class sessions visually.
- **Resource Directory**: Centralized management of:
  - **Faculty Profiles**: Emails, contact info, and designated off-days.
  - **Course Catalog**: Code, Title, Short-forms, and Credit mapping.
  - **Physical Resources**: Room numbers with distinct Laboratory vs Theory designations.
  - **Batching**: Organization of student batches and section distributions.

### 3. Professional Export Engine
- **Fine Table Output**: Unlike simple screenshots, the export function utilizes specialized CSS media queries to generate a professional, high-contrast academic table.
- **Print-Optimized**: Automatic removal of UI elements (buttons, headers) and conversion to black-and-white for clarity in physical distribution.

### 4. Conflict-Aware Scheduling Logic
The platform features an automated validation engine that guards against:
- **Time Overlaps**: Preventing teachers or rooms from being double-booked.
- **Off-Day Protection**: Warning admins if a class is placed on a teacher's scheduled day-off.
- **Resource Capacity**: Visual indicators for room saturation at any given time slot.

## Technical Architecture

- **Stack**: React 19 (SPA Architecture) + TypeScript.
- **UI Design**: Tailwind CSS implementing Material 3 Flat principles (Zero-shadow depth, rich color accents).
- **Icons**: Lucide React.
- **State Management**: Real-time updates with browser `localStorage` persistence.
- **Responsiveness**: Mobile-first design with slidable data grids and adaptive form modals.

## Administration
Access the administrative console via the "Admin Access" link in the header:
- **Username**: `admin`
- **Password**: `admin123`

---
*Developed by the CIS Academic Office, DIU.*