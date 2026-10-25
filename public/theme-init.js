(function () {
  try {
    var theme = localStorage.getItem("themeV2");
    if (theme !== "light" && theme !== "dark") theme = "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
