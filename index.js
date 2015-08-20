jQuery(function($) {
  $('.field-kit-example').each(function() {
    $('.docs-example .html', this).html($('.docs-example-code-html', this).text());
    var jsCode = $('.docs-example-code-js', this).text();
    var fn = new Function(jsCode);
    fn.call(this);
  });
});
