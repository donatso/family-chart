
Welcome to the **Family Chart API Documentation** - a powerful D3.js-based visualization library for creating beautiful, interactive family trees.

## 🚀 Quick Start Example

Here's a basic example showing how to create a family tree with the three main components:

```javascript
import * as f3 from 'family-chart';
import 'family-chart/dist/styles/family-chart.css';

// Your family tree data
const data = [
  {
    "id": "1",
    "data": {"first name": "John", "last name": "Doe", "birthday": "1980", "gender": "M"},
    "rels": {"spouses": ["2"], "children": ["3"]}
  },
  {
    "id": "2",
    "data": {"first name": "Jane", "last name": "Doe", "birthday": "1982", "gender": "F"},
    "rels": {"spouses": ["1"], "children": ["3"]}
  },
  {
    "id": "3",
    "data": {"first name": "Bob", "last name": "Doe", "birthday": "2005", "gender": "M"},
    "rels": {"father": "1", "mother": "2"}
  }
];

// Create the chart
const f3Chart = f3.createChart('#FamilyChart', data)

const f3Card = f3Chart.setCardHtml()
  .setCardDisplay([["first name","last name"],["birthday"]]);

const f3EditTree = f3Chart.editTree()
  .setFields(["first name","last name","birthday"]);

f3Chart.updateTree({initial: true});
```

## 🎯 Three Main Components

The Family Chart library is built around three core classes that work together:

### 1. **f3Chart** - [Chart Class](classes/Chart.html)
The main chart class for creating and managing family tree visualizations. This is your primary entry point for:
- Creating and configuring family tree visualizations
- Setting up data, styling, and interaction options
- Controlling tree layout, orientation, and display settings
- Managing user interactions and updates

### 2. **f3Card** - [CardHtml Class](classes/CardHtmlClass.html)
Handles HTML-based card rendering and customization for family tree nodes. Use this for:
- Custom card styling and layouts
- Image handling and display options
- Interactive behaviors (click, hover, etc.)
- Custom HTML content creation
- Card dimensions and positioning

### 3. **f3EditTree** - [EditTree Class](classes/EditTree.html)
Provides comprehensive editing capabilities for family tree data. This class handles:
- Adding new family members and relationships
- Editing existing person information
- Removing family members and relationships
- Form management and validation
- History tracking and undo/redo functionality
- Modal dialogs and user interactions

## 🔗 External Resources

- [GitHub Repository](https://github.com/donatso/family-chart)
- [Live Examples](https://donatso.github.io/family-chart-doc/examples/)
- [Visual Builder](https://donatso.github.io/family-chart-doc/create-tree/)