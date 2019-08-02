function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function encode(e) {
  return `data:image/svg+xml,${
    e.replace(/"/g, "'")
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/"/g, '%22')
      .replace(/'/g, '%27')
      .replace(/ /g, '%20')
      .replace(/{/g, '%7B')
      .replace(/}/g, '%7D')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
  }`;
}

var svgo = new SVGO({
  full: true,
  plugins: [{
    removeOffCanvasPaths: true,
  }]
});
  
new Vue({
  el: '#app',
  data: {
    backgroundColor: '#cccccc',
    foregroundColor: '#ea5959',
    percent: 50,
    startAngle: 50,
    endAngle: 180,
    sweepFlag: true,
    radius: 100,
    border: 10,
    svg: '',
    base64Svg: '',
    encodeSvg: '',
    show: false,
  },
  computed: {
    d() {
      const x = Number(this.radius) + Number(this.border);
      const y = x;
      const start = polarToCartesian(x, y, this.radius, this.startAngle);
      const end = polarToCartesian(x, y, this.radius, this.endAngle);
      
      const diff = this.sweepFlag ? this.endAngle - this.startAngle : this.startAngle - this.endAngle;
      
      let largeArcFlag = Number(diff > 180 || (diff < 0 && diff >= -180));
    
      const d = [
        "M", start.x, start.y, 
        "A", this.radius, this.radius, 0, largeArcFlag, this.sweepFlag ? 1 : 0, end.x, end.y
      ].join(" ");
      
      return d; 
    },
    width() {
      return (Number(this.radius) + Number(this.border)) * 2;
    },
    dasharray() {
      const percent = this.percent / 100;
      
      const diff = this.sweepFlag ? this.endAngle - this.startAngle : this.startAngle - this.endAngle;
      const ratio = (diff < 0 ? 360 + diff : diff) / 180;
    
      const perimeter = Math.PI * this.radius * ratio;
      return perimeter * percent + " " + perimeter * (1- percent);
    },
  },
  created() {
    // this.draw();
    new ClipboardJS('.copy');
  },
  methods: {
    async optimize(code) {
      return svgo.optimize(code)
        .then(result => result.data)
    },
    async showCode() {
      this.svg = await this.optimize(this.$refs.view.innerHTML);
      this.base64Svg = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(this.svg )));
      this.encodeSvg = encode(this.svg );
      this.show = true;
    },
    hide() {
      this.show = false;
    },
  }
})
