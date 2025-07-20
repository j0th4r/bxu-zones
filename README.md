# Butuan City AI Zoning Map Application

A comprehensive interactive mapping application for Butuan City, Agusan Del Norte municipal zoning districts powered by ESRI ArcGIS and AI-driven natural language search.

## Features

### Core Functionality
- **Interactive Mapping**: Built with ESRI JS API and ArcGIS for professional-grade mapping
- **AI-Powered Search**: Natural language queries for Philippine zoning regulations using OpenAI integration
- **Dynamic Zoning Display**: Muted-pastel fills for different zoning types
- **Parcel Information**: Detailed Philippine zoning code information for each parcel
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Zoning Types
- **Residential (R-1)**: Residential zones for housing developments - Purple (#DDA0DD)
- **Commercial (C-1)**: Commercial and business districts - Red (#CD5C5C)
- **Mixed Use (MU)**: Combined residential/commercial zones - Pink (#F0A0C0)
- **Industrial (I-1)**: Light industrial and manufacturing zones - Gray (#A9A9A9)
- **Open Space (OS)**: Parks and environmental protection areas - Green (#90EE90)

### Admin Features
- **Secure Dashboard**: OAuth/SSO authentication for administrators
- **Zoning Management**: Edit geometries and ordinance text
- **User Role Management**: Control access levels and permissions
- **AI Query Logs**: Monitor and analyze search patterns

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Mapping**: ESRI ArcGIS JS API
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: OpenAI API for natural language processing
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+
- ESRI ArcGIS API Key
- OpenAI API Key (for AI search functionality)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

### API Configuration

The application requires several API keys and endpoints:

- **ESRI ArcGIS**: For mapping services and spatial data
- **OpenAI**: For natural language search processing
- **Authentication Provider**: For secure admin access

### Deployment

The application is optimized for deployment to modern hosting platforms:

```bash
npm run build
```

## Usage

### Basic Navigation
- Use mouse/touch to pan and zoom the map
- Click on parcels to view detailed information
- Toggle the legend panel to show/hide zoning information

### AI Search
1. Click the search bar at the top of the screen
2. Enter natural language queries like:
   - "What can I build on Main Street?"
   - "Show me commercial zones with height limits over 100 feet"
   - "Find residential areas that allow multi-family buildings"
3. View instant results with map highlights and detailed summaries

### Admin Portal
- Access via the "Admin Portal" link in the header
- Manage zoning districts, user permissions, and system settings
- View AI query analytics and usage patterns

## Architecture

### Component Structure
```
src/
├── components/
│   ├── MapComponent.tsx      # Main ESRI map integration
│   ├── SearchBar.tsx         # AI-powered search interface
│   ├── Legend.tsx            # Dynamic zoning legend
│   ├── ParcelPopup.tsx       # Parcel detail modal
│   ├── SearchResults.tsx     # AI search results display
│   ├── AdminPortal.tsx       # Administrative dashboard
│   └── MapControls.tsx       # Map navigation controls
├── types/
│   └── zoning.ts            # TypeScript interfaces
├── utils/
│   └── api.ts               # API integration utilities
└── App.tsx                  # Main application component
```

### Data Flow
1. **Map Initialization**: ESRI map loads with zoning layer data
2. **User Interaction**: Click/search triggers API calls
3. **AI Processing**: Natural language queries processed by OpenAI
4. **Result Display**: Map highlights and popups show relevant information
5. **Admin Management**: Secure portal for data and user management

## Customization

### Adding New Zoning Types
1. Update the `ZoningDistrict` interface in `src/types/zoning.ts`
2. Add new zone configuration in `src/utils/api.ts`
3. Update the legend colors and styling as needed

### Extending AI Capabilities
- Modify the `searchWithAI` function in `src/utils/api.ts`
- Customize prompts and response formatting
- Add new query types and result formats

## Contributing

1. Follow the established code organization patterns
2. Maintain responsive design principles
3. Test across different devices and browsers
4. Document any new API integrations or features

## License

This project is designed for municipal government use and follows industry standards for GIS applications and data security.