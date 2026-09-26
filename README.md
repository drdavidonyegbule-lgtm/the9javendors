# 9Ja Quick Start

9Ja Vendors — Ultra-Lean MVP

Objective

This version is designed to launch the business with the smallest practical feature set.

The goal is simply to allow 9Ja Vendors to:

List Products → Receive Orders → Collect Payment → Fulfil Orders Manually

All supplier communication, procurement, dispatch coordination and customer follow-up can initially happen outside the system through phone calls, WhatsApp and internal staff processes.

Customer-Facing Features

Customers should be able to:

Visit the website

Browse products

View product images

View product names and descriptions

View prices

Add products to cart

Proceed to checkout

Enter name, phone number, email and delivery address

Pay through Paystack

Receive an order confirmation page

Receive an order reference number

No customer account is required for this version.

Customers do not need to log in before buying.

Product Management

9Ja Vendors staff should be able to:

Add a product

Upload product images

Enter product name

Enter product description

Enter selling price

Select a simple category

Mark a product as available or unavailable

Edit a product

Delete or hide a product

Internally, staff can optionally record:

Supplier name

Supplier phone number

Supplier cost price

This information should not be visible to customers.

Shopping Cart

The cart should allow customers to:

Add products

Remove products

Change quantity

View order subtotal

View delivery charge

View total payable

Proceed to checkout

Checkout

The checkout form should capture only:

Customer name

Phone number

Email

Delivery address

Delivery instructions

The customer then proceeds directly to Paystack.

Payment

Paystack should be integrated for online payment.

The system should:

Initiate payment

Verify successful payment

Generate an order after successful payment

Store the Paystack transaction reference

Prevent an unpaid order from being treated as paid

Order Management

The admin should have a simple orders page.

Each order should show:

Order number

Customer name

Phone number

Delivery address

Product ordered

Quantity

Amount paid

Payment reference

Date of order

Order status

The admin should be able to manually change the order status.

Only a few statuses are needed:

New Order

Processing

Out for Delivery

Delivered

Cancelled

Fulfilment Process

Once an order is received:

9Ja Vendors staff sees the new order.

Staff contacts the relevant supplier manually.

Staff obtains the product.

Staff pays the supplier outside the system.

Staff arranges a dispatch rider manually.

The item is delivered to the customer.

Staff changes the order status to Delivered.

No supplier workflow is required inside the system.

No rider workflow is required inside the system.

No holding-bay workflow is required inside the system.

Notifications

For the first version, notifications can be extremely simple.

The customer should receive:

Order/payment confirmation

The administrator should receive:

Notification of a new paid order

Email is sufficient initially.

WhatsApp and SMS automation can be added later.

Admin Dashboard

The dashboard only needs to show:

Total orders

New orders

Processing orders

Delivered orders

Total sales

No complex analytics are required.

Main Pages

The customer website should contain:

Home

Shop

Product Details

Cart

Checkout

Payment

Order Confirmation

Contact

Terms and Conditions

Privacy Policy

Returns Policy

Admin Pages

The admin area only needs:

Dashboard

Products

Add/Edit Product

Orders

Order Details

Settings

Features NOT Included

This ultra-lean version should intentionally exclude:

Customer accounts

Customer login

Order history

Detailed order tracking

Supplier portal

Supplier login

Supplier payment ledger

Procurement workflow

Holding-bay management

Rider portal

Rider tracking

Customer delivery confirmation

Rider delivery confirmation

Delivery PIN

Inventory management

Advanced reporting

Profitability dashboards

Supplier analytics

Rider analytics

Dispute management system

Automated refunds

WhatsApp automation

SMS automation

Advanced roles and permissions

Detailed audit logs

Ultra-Lean Workflow

Customer sees product

↓

Customer adds to cart

↓

Customer enters delivery details

↓

Customer pays through Paystack

↓

9Ja Vendors receives the order

↓

Staff contacts supplier manually

↓

Staff collects the product

↓

Staff arranges delivery manually

↓

Customer receives product

↓

Staff marks order as delivered

Purpose of This Version

This version is primarily for testing whether customers are willing to buy the products.

It allows 9Ja Vendors to start trading without first building an expensive operational system.

If sales begin to grow, the platform can then be expanded step by step with:

Customer accounts

Better order tracking

Supplier management

Rider management

Delivery verification

Inventory

Profit tracking

Automated notifications

Analytics

The philosophy is:

Sell first. Automate later.

I attached the image as a refference  for a colour pallete guide

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://the9javendors.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12dbe42c-7425-4a9b-a489-54bffb678b41).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
