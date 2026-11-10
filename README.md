# zone-in

Clickable prototype of **GameSlot**, a booking platform for gaming zones. Built with Angular 21 and Tailwind CSS 4. There is no backend: all data lives in browser `localStorage`, and demo data loads the first time the app opens.

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build
npm test -- --watch=false   # unit tests (Vitest)
```

Open the app and pick a role on the first screen:

- **Gaming Zone Owner**: pick a zone (Level Up Gaming has the most bookings today).
- **Customer**: enter any email, for example `ali.khan@example.com`. Customers can book a console slot, create or join 1v1 matches, and enroll in published tournaments.
- **Admin**: sees everything.

Use **Switch role** in the sidebar to go back.

## Reset the demo data

Demo dates are relative to the day the data was first loaded. To reload fresh data, run this in the browser console and refresh:

```js
Object.keys(localStorage).filter((key) => key.startsWith('gameslot.')).forEach((key) => localStorage.removeItem(key));
```

## Where things live

```
src/app/
  core/
    config/       app name, opening hours, route paths
    models/       TypeScript interfaces
    data/         seed data
    services/     data services (one per area) and business rules
    utils/        price, time slot, availability and stats helpers (unit tested)
    validators/   form validators and messages
    guards/       role guards
  shared/         sidebar, page header, stat card, status pill, dialogs, toasts, pipes
  features/       role-select, owner, customer, admin screens
```

`StorageService` acts as the mock database. Each service method (`getBookings(filters)`, `createBooking(dto)`, …) is shaped like an API call, so it can be swapped for HTTP calls to a .NET API later.

## Notes

- Angular 21 is used because Angular 22 needs Node 24.15 or newer.
- Icons come from `@lucide/angular`.
