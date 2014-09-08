$(document).ready(function()
{
  var labelHoverColour = "#58703A";
  var labelUnhoverColour = $(".label-default").css("background-color");

  var divHoverColour = "#EDFFE5";
  var divUnhoverColour = "#FFFFFF";

  var tags =
  [
    "lang-cplusplus",
    "lang-c",
    "lang-csharp",
    "lang-python",
    "lang-html",
    "lang-java",
    "lang-javascript",
    "lang-css",
    "lang-lua",
    "tool-git",
    "tool-visualstudio",
    "tool-sublime",
    "tool-perforce",
    "tool-eclipse"
  ];

  $.each(tags, function(index, value)
  {
    $("span." + value).hover(function()
    {
      $("span." + value).css("background-color", labelHoverColour);
      $("div." + value).css("background-color", divHoverColour);
    },
    function()
    {
      $("span." + value).css("background-color", labelUnhoverColour);
      $("div." + value).css("background-color", divUnhoverColour);
    });

    $("div." + value).hover(function()
    {
      if(!($("#pane-skills").is(":hidden")))
      {
        $("span." + value).css("background-color", labelHoverColour);
        $(this).css("background-color", divHoverColour);
      }
    },
    function()
    {
      if(!($("#pane-skills").is(":hidden")))
      {
        $("span." + value).css("background-color", labelUnhoverColour);
        $(this).css("background-color", divUnhoverColour);
      }
    });
  })
});
