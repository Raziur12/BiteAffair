# 🍽️ Bite Affair - Premium Catering Platform

A modern, responsive web application for premium catering and party platter services in Gurugram. Built with React, Tailwind CSS, and Material-UI.

## 🚀 Features

### 4 Menu Types
- **Jain Menu** - Pure vegetarian without onion, garlic & root vegetables
- **Packages** - Pre-designed party packages for different occasions
- **Customized** - Build your own menu with full customization
- **Cocktail Menu** - Individual items for cocktail parties

### Key Functionality
- ✅ Responsive design (mobile-first approach)
- ✅ Dietary filters (Veg/Non-Veg/Jain)
- ✅ Advanced search and filtering
- ✅ Real-time menu selection
- ✅ Contact forms and inquiry system
- ✅ Customer testimonials
- ✅ Location-based service (Gurugram)
- ✅ Professional UI/UX design

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.0
- **UI Components**: Material-UI 5.14.0
- **Icons**: Material-UI Icons
- **Fonts**: Poppins & Inter (Google Fonts)

## 📁 Project Structure

```
d:/BiteAffairs/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Hero.js
│   │   ├── MenuTabs.js
│   │   ├── MenuDisplay.js
│   │   ├── About.js
│   │   ├── Testimonials.js
│   │   ├── Contact.js
│   │   └── Footer.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── Menu Data Files/
│   ├── jain-menu.json
│   ├── packages-menu.json
│   ├── customized-menu.json
│   └── cocktail-party-menu.json
├── package.json
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd d:/BiteAffairs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 Design System

### Colors
- **Primary**: Orange (#f97316) - Brand color
- **Secondary**: Green (#22c55e) - Vegetarian items
- **Accent**: Yellow (#eab308) - Highlights
- **Gray Scale**: Various shades for text and backgrounds

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (body text)

## 📋 Menu Data Structure

Each menu type has its own JSON structure:

### Jain Menu
```json
{
  "menuTitle": "JAIN MENU",
  "starters": [...],
  "mainCourse": [...],
  "breads": [...],
  "desserts": [...]
}
```

### Packages
```json
{
  "packages": [
    {
      "name": "Package Name",
      "price": 8999,
      "pax": 20,
      "includes": {...}
    }
  ]
}
```

## 🔧 Customization

### Adding New Menu Items
1. Edit the relevant JSON file in the root directory
2. Follow the existing structure for consistency
3. Include all required fields (id, name, price, dietary, etc.)

### Styling Changes
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for custom CSS classes
- Component-specific styles in respective component files

<!-- ## 📞 Contact Information

- **Phone**: +91 92115 70030
- **Email**: orders@biteaffair.com
- **Service Area**: Gurugram & NCR
- **Availability**: 24/7 -->

## 🚀 Deployment

### Option 1: Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure custom domain if needed

### Option 2: Vercel
1. Connect your repository to Vercel
2. Configure build settings (React preset)
3. Deploy automatically on push

### Option 3: Traditional Hosting
1. Build the project: `npm run build`
2. Upload `build` folder contents to your web server
3. Configure server for SPA routing

## 🔍 SEO Optimization

- ✅ Meta tags configured
- ✅ Open Graph tags
- ✅ Semantic HTML structure
- ✅ Alt text for images
- ✅ Fast loading times
- ✅ Mobile-friendly design

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📈 Performance

- ✅ Optimized images and assets
- ✅ Code splitting
- ✅ Lazy loading where applicable
- ✅ Minimal bundle size
- ✅ Fast Time to Interactive (TTI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Material-UI team for excellent React components
- Tailwind CSS for utility-first CSS framework
- Google Fonts for typography
- All the customers who provided testimonials

---

**Bite Affair** - Making every bite memorable! 🍽️✨
