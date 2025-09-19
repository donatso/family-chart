# Installation & Quick Start

This guide will help you get started with Family Chart in just a few minutes.

## Installation

### NPM
```bash
npm install family-chart
```

### Yarn
```bash
yarn add family-chart
```

### CDN
For quick testing or simple HTML pages, you can use the CDN version:

```html
<script src="https://unpkg.com/family-chart@latest/dist/family-chart.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/family-chart@latest/dist/styles/family-chart.css">
```

## Quick Start

### HTML Example (CDN)

Copy and paste this HTML example to get started immediately:

```html
<!DOCTYPE html>
<head>
  <script src="https://unpkg.com/d3@7"></script>
  <link rel="stylesheet" href="https://unpkg.com/family-chart@latest/dist/styles/family-chart.css">
  <script type="module" src="https://unpkg.com/family-chart@latest"></script>
</head>
<body>
<div id="FamilyChart" class="f3" style="width:100%;height:900px;margin:auto;background-color:rgb(33,33,33);color:#fff;"></div>
<script type="module">

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
]

const f3Chart = f3.createChart('#FamilyChart', data)

f3Chart.setCardHtml()
  .setCardDisplay([["first name","last name"],["birthday"]])

f3Chart.updateTree({initial: true})
</script>
</body>
</html>
```

**That's it!** Save this as an HTML file and open it in your browser to see your family tree. No installation required - the library loads directly from CDN.

### NPM/ES6 Module Example

If you're using a bundler or ES6 modules:

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
const chart = f3.createChart('#FamilyChart', data)

chart.setCardHtml()
  .setCardDisplay([["first name","last name"],["birthday"]]);

chart.updateTree({initial: true});
```

## Framework Integration

### Vue

```vue
<template>
  <div class="f3" id="FamilyChart" style="width:100%;height:900px;margin:auto;background-color:rgb(33,33,33);color:#fff;"></div>
</template>

<script>
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';

export default {
  name: 'FamilyTree',
  mounted() {
    const data =  [
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
    ]
    const f3Chart = f3.createChart('#FamilyChart', data)

    f3Chart.setCardHtml()
      .setCardDisplay([["first name","last name"],["birthday"]]);

    f3Chart.updateTree({initial: true});
  }
};
</script>
```

### React

```jsx
import React, { useEffect, useRef } from 'react';
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';

const FamilyTree = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
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

      const f3Chart = f3.createChart('#FamilyChart', data)

      f3Chart.setCardHtml()
        .setCardDisplay([["first name","last name"],["birthday"]]);

      f3Chart.updateTree({initial: true});
    }
  }, []);

  return <div className="f3" id="FamilyChart" ref={chartRef} style={{width: '100%', height: '900px', margin: 'auto', backgroundColor: 'rgb(33,33,33)', color: '#fff'}} />;
};

export default FamilyTree;
```

> **Note**: The `chartRef` div must be created in the JSX return statement for the chart to render properly. The ref is used to attach the chart to the DOM element.

### Angular

```typescript
import { Component, ElementRef, OnInit } from '@angular/core';
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';

@Component({
  selector: 'app-family-chart',
  standalone: true,
  template:
    '<div class="f3" id="FamilyChart" style="width:100%;height:900px;margin:auto;background-color:rgb(33,33,33);color:#fff;"></div>',
})

export class FamilyTreeComponent implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
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
    ]

    const f3Chart = f3
      .createChart('#FamilyChart', data as f3.Data)

    f3Chart
      .setCardHtml()
      .setCardDisplay([['first name', 'last name'], ['birthday']]);

    f3Chart.updateTree({ initial: true });
  }
}
```

### Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import * as f3 from 'family-chart';
  import 'family-chart/styles/family-chart.css';

  let chartContainer;

  onMount(() => {
    if (!chartContainer) return

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

    const f3Chart = f3.createChart('#FamilyChart', data)

    f3Chart.setCardHtml()
      .setCardDisplay([["first name","last name"],["birthday"]]);

    f3Chart.updateTree({initial: true});
  });
</script>

<div class="f3" id="FamilyChart" bind:this={chartContainer} style="width:100%;height:900px;margin:auto;background-color:rgb(33,33,33);color:#fff;"></div>
```

## Next Steps

- 📖 **[Data Format Guide](data-format.md)** - Learn about the data structure
- 🎨 **[Examples](https://donatso.github.io/family-chart-doc/examples/)** - Browse more examples
- 🎨 **[Visual Builder](https://donatso.github.io/family-chart-doc/create-tree/)** - Generate code with the visual builder
- 📚 **[API Reference](https://donatso.github.io/family-chart/)** - Complete API documentation

## Troubleshooting

### Common Issues

1. **Chart not displaying**: Make sure you have included the CSS file
2. **D3 errors**: Ensure D3.js is loaded before Family Chart
3. **Module errors**: Check that you're using the correct import syntax for your environment

### Getting Help

- Check the [Examples](https://donatso.github.io/family-chart-doc/examples/) for working code
- Use the [Visual Builder](https://donatso.github.io/family-chart-doc/create-tree/) to generate code
- Report issues on [GitHub](https://github.com/donatso/family-chart/issues)
