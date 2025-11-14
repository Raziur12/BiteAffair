// Testimonials data for customer reviews
export const testimonialsData = [
  {
    id: 1,
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Amazing food quality and excellent service. Our guests loved the Jain menu options!',
    avatar: 'PS',
    location: 'Delhi',
    eventType: 'Birthday Party',
    date: '2024-10-15'
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'Perfect catering for our office party. Everything was fresh and delicious.',
    avatar: 'RK',
    location: 'Gurugram',
    eventType: 'Office Party',
    date: '2024-10-10'
  },
  {
    id: 3,
    name: 'Anita Gupta',
    rating: 4,
    comment: 'Great variety in the menu and very professional team. Highly recommended!',
    avatar: 'AG',
    location: 'Noida',
    eventType: 'House Party',
    date: '2024-10-05'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    rating: 5,
    comment: 'Outstanding service and authentic flavors. The cocktail party menu was a huge hit!',
    avatar: 'VS',
    location: 'Faridabad',
    eventType: 'Cocktail Party',
    date: '2024-09-28'
  },
  {
    id: 5,
    name: 'Meera Patel',
    rating: 4,
    comment: 'Professional staff and delicious food. Will definitely book again for future events.',
    avatar: 'MP',
    location: 'Ghaziabad',
    eventType: 'Pre-Wedding',
    date: '2024-09-20'
  }
];

// Get testimonials by rating
export const getTestimonialsByRating = (minRating = 4) => {
  return testimonialsData.filter(testimonial => testimonial.rating >= minRating);
};

// Get testimonials by event type
export const getTestimonialsByEventType = (eventType) => {
  return testimonialsData.filter(testimonial => 
    testimonial.eventType.toLowerCase().includes(eventType.toLowerCase())
  );
};

// Get recent testimonials
export const getRecentTestimonials = (count = 3) => {
  return testimonialsData
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
};

// Get random testimonials
export const getRandomTestimonials = (count = 3) => {
  const shuffled = [...testimonialsData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default { 
  testimonialsData, 
  getTestimonialsByRating, 
  getTestimonialsByEventType, 
  getRecentTestimonials,
  getRandomTestimonials 
};
