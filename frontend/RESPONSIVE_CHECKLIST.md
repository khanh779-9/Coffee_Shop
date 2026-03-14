# Responsive QA Checklist

Date: 2026-03-14
Project: Coffee Shop Frontend (Angular)

## Devices / Viewports

Use these viewport widths in browser DevTools:

- 320 x 568 (extra small phone)
- 360 x 800 (Android small)
- 390 x 844 (iPhone 12/13)
- 414 x 896 (large phone)
- 744 x 1133 (iPad mini portrait)
- 1133 x 744 (iPad mini landscape)
- 768 x 1024 (tablet portrait)
- 1024 x 768 (tablet landscape)
- 1280 x 800 (desktop)

## Global Navigation and Overlay

- [ ] Top bar does not overlap content in a broken way on every page.
- [ ] Mobile menu button is visible at <= 768px.
- [ ] Mobile menu opens with overlay and can be closed by:
- [ ] tapping overlay
- [ ] selecting a menu item
- [ ] pressing Escape key
- [ ] Background page does not scroll while mobile menu is open.
- [ ] Cart sidebar opens and closes correctly on desktop and mobile.
- [ ] Cart sidebar can be closed by Escape key.
- [ ] Background page does not scroll while cart is open.
- [ ] Touch targets for nav toggle, cart button, and close button feel comfortable.
- [ ] Hidden mobile menu links cannot be tab-focused when menu is closed.
- [ ] Hidden cart actions cannot be tab-focused when cart is closed.

## Accessibility Quick Pass

- [ ] Keyboard focus ring is visible on links and buttons.
- [ ] Nav toggle has aria-expanded that changes correctly.
- [ ] Cart toggle has aria-expanded that changes correctly.
- [ ] Mobile menu has meaningful aria-hidden state when closed.
- [ ] Cart sidebar has meaningful role/aria-hidden state when closed.
- [ ] Reduced-motion mode still keeps menu/cart usable.

## Home Page

- [ ] Hero title and buttons remain readable at 360px.
- [ ] Hero CTA buttons wrap cleanly and never overflow.
- [ ] Features cards stack to 1 column on small phones.
- [ ] Drink cards switch from 3 -> 2 -> 1 columns by viewport size.
- [ ] About section content never clips vertically.
- [ ] Contact cards stack and spacing remains balanced.
- [ ] Footer columns collapse gracefully and links remain tappable.

## Order Page

- [ ] Two-column layout collapses to one column under 900px.
- [ ] Product cards do not overflow horizontally at 360px.
- [ ] Product image, quantity controls, line total, and remove button remain usable.
- [ ] Form fields and submit button remain fully visible and easy to use.
- [ ] Empty-cart state is readable and action link is accessible.

## Admin Login

- [ ] Intro panel and login form stack correctly on small screens.
- [ ] Inputs and submit button are full width and readable.
- [ ] Error message does not overflow card boundaries.

## Admin Orders

- [ ] Header actions wrap correctly without overlap.
- [ ] Each order card remains readable at 360px.
- [ ] Item rows stack and totals remain aligned.
- [ ] Status select is usable on touch screens.

## Admin Content

- [ ] Content grid collapses to one column on tablet/mobile.
- [ ] Hero/category/product forms keep input controls full width.
- [ ] Action buttons wrap instead of clipping.
- [ ] List rows stack and action buttons remain visible.

## Regression Checks

- [ ] Build succeeds: npm run build (frontend).
- [ ] No console errors while opening/closing menu and cart.
- [ ] No major layout shift when toggling mobile menu or cart.

## Notes Template

- Viewport:
- Page:
- Issue:
- Steps to reproduce:
- Expected:
- Actual:
- Screenshot file:
