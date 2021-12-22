# ligature

Layout encapsulation for Express

## Usage

  npm install --save git@github.com:tingham/ligature.git

Create a "layout.ejs" in your views directory that includes the tag:

```

  <%- body %>

```

In your application configuration ensure the following lines are present

```

  const Ligature = require("ligature").Ligature
  const ligature = new Ligature(null)
  
  // ...  application configuration
  
  app.use('*', async (req, res, next) => {
    ligature.render(req, res, next)
  })

```
