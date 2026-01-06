/**
 * Shared Types for Vivare Frontend
 */

// ============================================
// Listings
// ============================================

export interface Photo {
    id: string;
    url: string;
    order: number;
    caption?: string;
}

export interface Address {
    neighborhood: string;
    city: string;
    state: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface Listing {
    id: string;
    name: string;
    address: Address;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    propertyType: string;
    amenities: string[];
    photos: Photo[];
    description?: string;
    thumbnail: string;
    pricePerNight?: number;
    featured?: boolean;
}

export interface ListingDetail extends Listing {
    houseRules?: string;
    checkInTime?: string;
    checkOutTime?: string;
    highlights?: string[];
    cancellationPolicy?: {
        type: string;
        description: string;
    };
}

// ============================================
// Calendar
// ============================================

export interface CalendarDay {
    date: string; // YYYY-MM-DD
    available: boolean;
    price?: number;
    minStay?: number;
    closedToArrival?: boolean;
    closedToDeparture?: boolean;
}

export interface ListingCalendar {
    listingId: string;
    days: CalendarDay[];
}

// ============================================
// Price Calculation
// ============================================

export interface PriceBreakdown {
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
}

export interface Quote {
    listingId: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    total: number;
    currency: string;
    breakdown: PriceBreakdown;
}

// ============================================
// Guests
// ============================================

export interface Guests {
    adults: number;
    children: number;
    infants: number;
}

export interface GuestInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    document?: string;
}

// ============================================
// Checkout
// ============================================

export type CheckoutState =
    | 'INITIATED'
    | 'HOLD_CREATED'
    | 'PAYMENT_CREATED'
    | 'PAID'
    | 'BOOKED'
    | 'CANCELED'
    | 'EXPIRED'
    | 'FAILED';

export interface Checkout {
    checkoutId: string;
    state: CheckoutState;
    listingId: string;
    listingName?: string;
    checkIn: string;
    checkOut: string;
    guests: Guests;
    quote: {
        total: number;
        currency: string;
        breakdown: PriceBreakdown;
    };
    guest?: GuestInfo;
    staysBookingCode?: string;
    holdExpiresAt?: string;
}

export interface CreateCheckoutParams {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: Guests;
    couponCode?: string;
}

export interface PaymentIntentResult {
    checkoutId: string;
    clientSecret: string;
    state: CheckoutState;
}

// ============================================
// Booking
// ============================================

export interface Booking {
    code: string;
    listingId: string;
    listingName: string;
    checkIn: string;
    checkOut: string;
    guests: Guests;
    guest: GuestInfo;
    total: number;
    currency: string;
    status: 'confirmed' | 'canceled';
    cancellationPolicy?: {
        type: string;
        description: string;
        canCancel: boolean;
    };
}

// ============================================
// Search
// ============================================

export interface SearchFilters {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    city?: string;
    neighborhood?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    bedrooms?: number;
    featured?: boolean;
}

export interface SearchResults {
    listings: Listing[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// Content (CMS)
// ============================================

export interface HeroContent {
    headline: string;
    subheadline: string;
    backgroundImage?: string;
    cta: {
        text: string;
        href: string;
    };
}

export interface HomeContent {
    hero: HeroContent;
    sections: {
        featured: { visible: boolean; order: number };
        howItWorks: { visible: boolean; order: number };
        collections: { visible: boolean; order: number };
        testimonials: { visible: boolean; order: number };
    };
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category?: string;
    order: number;
}

export interface Banner {
    id: string;
    title: string;
    message: string;
    cta?: string;
    ctaUrl?: string;
    active: boolean;
}
