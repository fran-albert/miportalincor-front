# Green Card (Cartoncito Verde) Frontend Implementation

## Overview
The "Cartoncito Verde" feature is a digital version of the traditional medication card that doctors provide to patients. It allows doctors to manage patients' routine medications and patients to view and request prescriptions.

## Implementation Status
✅ **COMPLETED** - All frontend components, pages, and integration are ready.

---

## Files Created/Modified

### 1. Types (`src/types/Green-Card/`)
- **GreenCard.ts** - TypeScript interfaces for all green card entities
  - `GreenCard`: Main card entity with doctor/patient info
  - `GreenCardItem`: Individual medication item
  - `CreateGreenCardDto`, `UpdateGreenCardItemDto`: DTOs
  - `GreenCardSummary`: Summary statistics

### 2. API Actions (`src/api/Green-Card/`)
All API calls implemented:
- `get-my-green-cards.action.ts` - Patient: Get all cards
- `get-my-cards-summary.action.ts` - Patient: Get summary
- `get-patient-green-cards.action.ts` - Doctor: Get patient's cards
- `get-my-card-for-patient.action.ts` - Doctor: Get/create own card for patient
- `get-green-card-by-id.action.ts` - Get card by ID
- `create-green-card.action.ts` - Create new card
- `add-green-card-item.action.ts` - Add medication
- `update-green-card-item.action.ts` - Update medication
- `toggle-green-card-item.action.ts` - Toggle active/suspended
- `delete-green-card-item.action.ts` - Delete medication
- `request-prescription.action.ts` - Patient: Request prescription

### 3. Hooks (`src/hooks/Green-Card/`)
- **useGreenCard.ts** - React Query hooks for fetching data
  - `useGreenCardById`: Fetch single card
  - `useMyGreenCards`: Patient's all cards
  - `usePatientGreenCards`: Doctor viewing patient cards
  - `useMyCardForPatient`: Doctor's card for specific patient
  - `useMyCardsSummary`: Patient's summary stats

- **useGreenCardMutation.ts** - React Query mutations
  - `createGreenCardMutation`: Create new card
  - `addItemMutation`: Add medication
  - `updateItemMutation`: Update medication
  - `toggleItemMutation`: Toggle active/suspended
  - `deleteItemMutation`: Delete medication
  - `requestPrescriptionMutation`: Request prescription

### 4. Validators (`src/validators/`)
- **green-card.schema.ts** - Zod schema for form validation
  - Validates medication name, dosage, schedule, frequency, notes

### 5. Components (`src/components/Green-Card/`)
- **GreenCardView.tsx** - Main view component
  - Displays card header with doctor info
  - Shows active medications table (grouped by schedule)
  - Shows suspended medications table
  - Handles add/edit/delete/toggle/request prescription actions
  - Different views for doctor vs patient

- **GreenCardList.tsx** - List view component
  - Shows all cards for a patient
  - Preview of medications per card
  - Clickable cards to view details

- **GreenCardItemFormModal.tsx** - Add/Edit medication form
  - Dialog with form fields (schedule, medication, dosage, frequency, notes)
  - Validation with Zod schema
  - Create or update mode

- **RequestPrescriptionModal.tsx** - Request prescription confirmation
  - Shows medication details
  - Confirmation dialog for patients to request prescription

### 6. Pages

#### Patient Pages (`src/pages/protected/`)
- **My-Green-Cards/index.tsx** - Patient's main page (`/mi-medicacion`)
  - Lists all green cards from different doctors
  - Info card explaining what green cards are
  - Detail view when clicking a card
  - Allows requesting prescriptions

#### Doctor Pages (`src/pages/protected/Patient/`)
- **Green-Card/index.tsx** - Doctor's patient green card page
  - Route: `/pacientes/:slug/cartoncito-verde`
  - Shows patient's green card
  - Allows doctor to add/edit/delete medications
  - Can toggle medications active/suspended

### 7. Routes (`src/routes.tsx`)
Added routes:
```tsx
// Patient route
<Route path="/mi-medicacion" element={<MyGreenCardsPage />} />

// Doctor route for patient's green card
<Route path="/pacientes/:slug/cartoncito-verde" element={<PatientGreenCardPage />} />
```

### 8. Navigation Integration

#### Sidebar (`src/components/Sidebar/index.tsx`)
- Added "Mi Medicación" menu item for patients
- Icon: Pill
- Only visible to patients (strict role)

#### Patient Dashboard Module (`src/components/Patients/Modules/index.tsx`)
- Added "Cartoncito Verde" module card
- Visible only for doctors viewing patient dashboard
- Navigates to patient's green card management page

### 9. Permissions (`src/common/constants/permissions.ts`)
Added permission:
```typescript
MY_GREEN_CARDS: [Role.PACIENTE]
```
Added to STRICT_PERMISSIONS (patient-only, no admin override)

---

## Features

### For Patients
1. **View Medications**: See all medications from all their doctors
2. **Multiple Cards**: Can have cards from different doctors
3. **Request Prescriptions**: Click button on any active medication to request prescription
4. **Organized View**: Medications grouped by schedule (Ayuno, 08:00, 12:00, 20:00, etc.)
5. **Status Visibility**: See active vs suspended medications

### For Doctors
1. **Manage Medications**: Create green card for patient (auto-created on first access)
2. **Add Medications**: Add new medications with schedule, dosage, frequency, notes
3. **Edit Medications**: Update medication details
4. **Toggle Status**: Activate or suspend medications
5. **Delete Medications**: Remove medications from card
6. **View Only Own Card**: Can see other doctors' cards but only edit their own
7. **Module Integration**: Access green card from patient dashboard

---

## UI/UX Design

### Color Theme
- **Primary**: Green (#16a34a, #15803d) - matches "cartoncito verde" name
- **Success Badge**: Active medications
- **Warning Badge**: Suspended medications
- **Blue**: Request prescription actions

### Component Features
- **Green header** with gradient for card identity
- **Grouped medications** by schedule for easy reading
- **Badge counts** showing active/total medications
- **Responsive design** using Tailwind CSS and shadcn/ui
- **Loading states** with spinners
- **Empty states** with helpful messages
- **Confirmation dialogs** for destructive actions
- **Toast notifications** for success/error feedback

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliant
- Clear visual hierarchy

---

## Backend API Endpoints (Already Implemented)

### Patient Endpoints
- `GET /green-cards/my-cards` - Get all cards
- `GET /green-cards/my-cards/summary` - Get summary
- `POST /green-cards/:cardId/items/:itemId/request-prescription` - Request prescription

### Doctor Endpoints
- `GET /green-cards/patient/:patientUserId` - Get patient's cards
- `GET /green-cards/my-card/:patientUserId` - Get/create own card for patient
- `POST /green-cards` - Create card
- `POST /green-cards/:cardId/items` - Add medication
- `PATCH /green-cards/:cardId/items/:itemId` - Update medication
- `PATCH /green-cards/:cardId/items/:itemId/toggle-active` - Toggle status
- `DELETE /green-cards/:cardId/items/:itemId` - Delete medication

### Shared
- `GET /green-cards/:cardId` - Get card by ID

---

## How to Use

### As a Patient
1. Navigate to "Mi Medicación" from sidebar
2. View all your green cards from different doctors
3. Click a card to see details
4. Click "Solicitar Receta" on any active medication to request prescription
5. Track which doctor prescribed which medications

### As a Doctor
1. Go to patient's dashboard
2. Click "Cartoncito Verde" module
3. Add medications by clicking "Agregar Medicamento"
4. Fill in schedule, medication name, dosage, frequency, and notes
5. Manage medications: edit, suspend/activate, or delete
6. View medications from other doctors (read-only)

---

## Integration Points

1. **Prescription Requests**: When patient requests prescription, it creates a PrescriptionRequest linked to the green card item
2. **Patient Dashboard**: Integrated as a module card for easy doctor access
3. **Sidebar Navigation**: Patient menu item for quick access
4. **Role-Based Permissions**: Strict separation between patient and doctor views

---

## Testing Checklist

- [ ] Patient can view their green cards
- [ ] Patient can request prescription for active medication
- [ ] Doctor can create green card for patient (auto-created)
- [ ] Doctor can add medication to card
- [ ] Doctor can edit medication details
- [ ] Doctor can toggle medication active/suspended
- [ ] Doctor can delete medication
- [ ] Doctor can only edit their own card
- [ ] Doctor can view other doctors' cards (read-only)
- [ ] Medications grouped correctly by schedule
- [ ] Empty states display properly
- [ ] Loading states show during API calls
- [ ] Error states handle gracefully
- [ ] Toasts show for success/error
- [ ] Confirmation dialogs work for destructive actions
- [ ] Mobile responsive design works
- [ ] Navigation from sidebar works (patient)
- [ ] Navigation from patient dashboard works (doctor)

---

## Future Enhancements (Optional)

1. **Print View**: Print-friendly version of green card
2. **PDF Export**: Download green card as PDF
3. **Medication History**: Track changes to medications over time
4. **Drug Interactions**: Check for potential interactions
5. **Reminders**: Set medication reminders for patients
6. **Dosage Calculator**: Help calculate dosages
7. **Medication Library**: Auto-complete from common medications
8. **Multi-language Support**: Translate medication instructions

---

## Notes

- All components follow the project's established patterns
- Uses shadcn/ui components consistently
- Follows React Query patterns for data fetching
- Implements proper loading and error states
- Responsive design with Tailwind CSS
- TypeScript types are complete and accurate
- Zod validation for all forms
- Toast notifications using Sonner
- Helmet for SEO meta tags
