# HVAC Wizard Frontend

This is a React Hook Form-based multi-step wizard for HVAC quote requests.

## Features Implemented

✅ **Step 1: Address Collection**

- Street, City, State, ZIP validation
- React Hook Form with Zod validation
- Clean UI with ShadCN components

✅ **Step 2: AC Units Selection**

- Radio button selection (1, 2, More than 3, I don't know)
- Form validation and state management

✅ **Wizard State Management**

- React Context + useReducer pattern
- Navigation between steps
- Data persistence across steps

✅ **Progress Indicator**

- Visual progress bar
- Current step display

✅ **Beautiful UI**

- ShadCN UI components
- Tailwind CSS styling
- Responsive design

## Architecture

### State Management

- **WizardContext**: Centralized state using React Context + useReducer
- **Form Validation**: Zod schemas with React Hook Form
- **Step Navigation**: Forward/backward navigation with data persistence

### Components Structure

```
src/
├── components/wizard/
│   ├── WizardContainer.tsx      # Main wizard component
│   ├── WizardProgress.tsx       # Progress indicator
│   ├── AddressStep.tsx          # Step 1: Address form
│   ├── ACUnitsStep.tsx          # Step 2: AC units selection
│   └── SummaryStep.tsx          # Step 3: Summary display
├── context/
│   └── WizardContext.tsx        # Global wizard state management
├── types/
│   └── wizard.ts               # TypeScript interfaces
└── lib/
    └── schemas.ts              # Zod validation schemas
```

## Installation & Setup

```bash
npm install
npm run dev
```

## Key Technologies Used

- **Next.js 15** with App Router
- **React Hook Form** for form management
- **Zod** for validation schemas
- **ShadCN UI** for components
- **Tailwind CSS** for styling
- **TypeScript** for type safety

## Usage

1. Fill out your address information
2. Select number of AC units
3. Navigate back/forward between steps
4. View summary of collected data

## Next Steps

To complete the full requirements, you would:

1. Add remaining steps (System Type, Heating Type, Contact Info, Confirmation)
2. Implement backend API integration
3. Add conditional logic for "I don't know" responses
4. Add contact page for edge cases
5. Implement data persistence to backend
