const styles = document.createElement('style')

styles.innerText = `
body {
  margin: 0;
  font-family: 'Fira Mono', sans-serf;
  min-height: calc( 100vh - 64px );
  background: no-repeat linear-gradient(60deg,
                rgba(0,0,0,0.8),
                rgb(32,32,32,0.5) 50%,
                rgb(16,16,16,0.6) 50%,
                rgb(16,32,24,0.8)),
              no-repeat linear-gradient(120deg,
                rgba(150,150,220,0.4),
                rgba(210,100,100,0.4));
}

header {
  z-index: 100;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 56px;
  padding: 0 16px;
  background: rgb(32, 32, 32, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
header > p {
  display: inline-block;
  float:right;
  text-align: center;
  color: #ddd;
}
header > p > a {
  text-decoration: none;
  color: #ddd;
}
header > p > a:hover {
  color: #fff;
}
header::after {
  position: fixed;
  height: 1px;
  top: 56px;
  right: 0;
  left: 0;
  background: linear-gradient(to right, #e66465, #9198e5);
  content: "";
}
main {
  padding: 10px 16px;
  margin-top: 56px;
  display: flex;
  flex-flow: wrap;
  justify-content: center;
}

.card {
  position: relative;
  min-width: 300px;
  height: 200px;

  border: 1px solid;
  border-image: linear-gradient(to top, #555, #888) 1 stretch;
  margin: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-link {
  text-decoration: none;
  color: rgba(0,0,0,0);
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  padding: 8px 16px;
  transition: 0.4s;
  min-width: 0px;
  min-height: 0px;
  z-index: 2;
}
.screenshot {
  position: absolute;
  z-index: 1;
  width: 300px;
  height: 200px;
}

.card:hover > .item-link {
  background: rgba(0, 0, 0, 0.7);
  color: #FFF;
  padding: 91px 16px;
  min-width: 300px;
  min-height: 200px;
}
.title {
  display: inline-block;
  color: #fff;
}

footer {
  min-height: 120px;
  box-sizing: border-box;
}
@media (min-width: 600px) {
  header {
    height: 64px;
    padding: 0 24px;
  }
  header::after {
    top: 64px;
  }
  main {
    padding: 20px 24px;
    margin-top: 64px;
  }
}


`

export default styles
