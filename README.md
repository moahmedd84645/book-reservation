# Book Booking System

This is a comprehensive book booking system designed for university students. It allows administrators to manage subjects, track student bookings, generate unique codes for each booking, send confirmations via WhatsApp, and export all data to an Excel file.

## Features

- **New Bookings:** A simple form to add new student bookings.
- **Booking List:** View, search, edit, and delete all existing bookings.
- **Subject Management:** Dynamically add or remove available subjects and their code prefixes.
- **WhatsApp Integration:** Automatically generate and send a formatted confirmation message to students via WhatsApp.
- **Excel Export/Import:** Export all booking data into a structured Excel sheet, or import bookings from a pre-formatted Excel file.
- **Persistent Storage:** All data (bookings, subjects, settings) is saved in the browser's local storage, so you don't lose your data on refresh.
- **Duplicate Prevention:** Prevents adding a new booking with the same student name and phone number.

## Deployment

This project is configured for easy deployment on platforms like Vercel or Netlify. Simply connect your Git repository and deploy.
