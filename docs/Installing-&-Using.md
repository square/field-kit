> [Wiki](Home) ▸ **Installing & Using**

## Installing

You can download the latest version from [GitHub](https://github.com/square/field-kit/releases) or from our [CDN](https://cdnjs.com/libraries/field-kit) and include the js file.

```html
<html>
  <head>
    <script src="field-kit.min.js"></script>
  </head>
  <body>
    <input id="ssn" />

    <script>
      var field = new FieldKit.TextField(document.getElementById('ssn'));
      field.setValue('123-45-6789');
    </script>
  </body>
</html>
```

You may also link to the CDN file directly. https://cdnjs.com/libraries/field-kit

NOTE: _Make sure you add the `charset="utf-8"` attribute to your script tag._

You can use also [npm](https://www.npmjs.com/) to install FieldKit for use in your project.

`$ npm i field-kit --save`

## Usage

Once you have the `FieldKit` instance available on your page, the simplest usage is:

```html
<input type="text" id="text-field-example" />

<script>
  var field = new FieldKit.TextField(document.getElementById('text-field-example'));
  field.setFocusedPlaceholder('YT-1300');
  field.setUnfocusedPlaceholder('Ship Name');
</script>
```