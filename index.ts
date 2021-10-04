import { Chart } from 'chart.js';

console.clear();

const BAR_WIDTH_S = 12;
const BAR_WIDTH_M = 24;
const BAR_WIDTH_XL = 48;
const MIN_IMAGE_SIZE_VERTICAL_MODE = BAR_WIDTH_XL; // based on the tickest bar
const AVAILABLE_AREA = '#F0F3F5';
const SPACE_BETWEEN_TICKS_HORIZONTAL_MODE = 140;

const enum DIRECTION {
  VERTICAL,
  HORIZONTAL,
}

let direction = DIRECTION.VERTICAL;

let graphWidth = 100;

const labels = ['Canada', 'France', 'Italy', 'USAUSAUSA USA USA'];
const images = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/324px-Tour_Eiffel_Wikimedia_Commons.jpg',
  'https://www.countryflags.com/wp-content/uploads/france-flag-png-large.png',
  'https://www.countryflags.com/wp-content/uploads/italy-flag-png-large.png',
  'https://c4.wallpaperflare.com/wallpaper/28/832/21/ultrawide-8k-no-mans-sky-poster-wallpaper-preview.jpg',
];
const values = [48, 56, 33, 78];
const barColors = ['#00BBE6', '#1B2C8F', '#D85E5E', '#DEB454'];

let imagesSize = [
  { width: 324, height: 600 },
  { width: 1000, height: 667 },
  { width: 1000, height: 667 },
  { width: 728, height: 256 },
];

let dataLabels = labels;
let dataImages = images;
let dataValues = values;

(function moreData() {
  dataLabels = [...labels, ...labels, ...labels, ...labels];
  dataImages = [...images, ...images, ...images, ...images];
  dataValues = [...values, ...values, ...values, ...values];
  imagesSize = [...imagesSize, ...imagesSize, ...imagesSize, ...imagesSize];
})();

const mainContainerStyle = `display: flex; width: 100%;`;

const chartContainerStyle = `
  border: 1px dashed red;
  display: flex;
  flex-direction: column;
`;

const labelStyles = ` margin-top: 8px; text-overflow: ellipsis;
                      overflow: hidden; max-width: ${BAR_WIDTH_XL}px;`;

const legendStyle = `border: 1px dashed orange; display: flex; flex-direction: column;
    justify-content: space-between; overflow-y: auto; word-break: break-all;
`;

let shouldDrawImages = true;
let shouldDrawTooltips = true;

const plugins = [
  {
    id: 'afterDraw',
    afterDraw: (chart: Chart) => {
      addImages(chart);
    },
  },
  {
    id: 'afterRender',
    afterRender: (chart: Chart) => {
      addTooltips();
    },
  },
];

const data = {
  labels: dataLabels,
  datasets: [
    {
      data: dataValues,
      barThickness: BAR_WIDTH_S,
      backgroundColor: barColors,
    },
  ],
};

const optionsVertical = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        display: true,
        padding: 0,
        callback: () => '',
      },
    },
    y: {
      grid: {
        display: true,
        drawBorder: false,
      },
      ticks: {
        display: true,
      },
      position: 'left',
      offset: false,
    },
  },
} as any;

const ctx = document.getElementById('chart') as HTMLCanvasElement;

const chartObj = new Chart(ctx, {
  type: 'bar',
  plugins,
  data,
  options: optionsVertical,
});

const valuesLength = dataValues.length;
const height = SPACE_BETWEEN_TICKS_HORIZONTAL_MODE * valuesLength;

function init() {
  direction = DIRECTION.HORIZONTAL;
  chartObj.config.options = optionsVertical;
  chartObj.canvas.parentElement.style.height = `40vh`;

  // drawLegend();
}

const mainContainer = document.querySelector('.main-container');
mainContainer.setAttribute('style', `${mainContainerStyle}; max-height: 40vh;`);

const chartContainer = document.querySelector('.chart-container');
chartContainer.setAttribute(
  'style',
  `${chartContainerStyle}; width: ${graphWidth}%`
);

const xAxisContainer = document.querySelector('.x-axis-container');
const legendContainer = document.querySelector('.legend-container');
const inputWidth = document.getElementById('chart-width') as HTMLInputElement;

const addTooltips = () => {
  if (!shouldDrawTooltips) return;
  console.log('addTooltips');
  const xAxisLabels = document.querySelectorAll('#xAxis-label');
  xAxisLabels.forEach((yAxisLabel, index) => {
    if (yAxisLabel.clientWidth < yAxisLabel.scrollWidth) {
      const tooltipElement = document.createElement('div');
      tooltipElement.setAttribute('class', 'tooltip');
      tooltipElement.setAttribute('data-index', `${index}`);
      tooltipElement.textContent = dataLabels[index];
      yAxisLabel.appendChild(tooltipElement);
      yAxisLabel.setAttribute('class', 'label-hover');
      yAxisLabel.addEventListener('mouseover', () => {
        const tooltip = document.querySelector(
          `div.tooltip[data-index="${index}"]`
        );
        tooltip.setAttribute('class', `tooltip tooltip-on`);
      });
      yAxisLabel.addEventListener('mouseout', () => {
        const tooltip = document.querySelector(
          `div.tooltip[data-index="${index}"]`
        );
        tooltip.setAttribute('class', `tooltip`);
      });
    }
  });
  shouldDrawTooltips = false;
};

const addImages = (chart: Chart) => {
  if (!shouldDrawImages) return;

  console.log('addImages');

  const xAxis = chart.scales.x;
  const x = xAxis.left;

  xAxisContainer.setAttribute(
    'style',
    `display: flex;
    flex-direction: row;
    border: 1px dashed green;
    justify-content: space-around;
    padding-left: ${Math.trunc(x)}px;`
  );

  let barHeight = chart.getDatasetMeta(0).data[0]['height'];

  if (direction === DIRECTION.HORIZONTAL) {
    const bar1TickY = xAxis.getPixelForTick(0);
    const bar2TickY = xAxis.getPixelForTick(1);

    const distanceBetweenBars =
      bar2TickY - bar1TickY - chart.getDatasetMeta(0).data[0]['height'];

    const availableSpaceForXAxisLabels = BAR_WIDTH_XL;

    while (xAxisContainer.hasChildNodes()) {
      xAxisContainer.removeChild(xAxisContainer.lastChild);
    }

    xAxis.ticks.forEach((tick, index) => {
      const image = new Image();
      image.src = dataImages[index];

      let imageWidth, imageHeight;

      let ratio = imagesSize[index].width / imagesSize[index].height;
      const xTick = xAxis.getPixelForTick(index);

      barHeight = BAR_WIDTH_XL;

      const imageX = x;
      let imageY = xTick - barHeight / 2;
      const rectY = imageY;
      const textY = imageY + barHeight + distanceBetweenBars / 8;

      let emptyHeight = 0;

      if (ratio >= 1) {
        imageHeight = availableSpaceForXAxisLabels / ratio;
        imageWidth = availableSpaceForXAxisLabels;
        emptyHeight = barHeight - imageHeight;

        if (emptyHeight < 0) {
          imageHeight = barHeight;
          imageWidth = barHeight * ratio;
        }

        if (emptyHeight > 0) {
          imageY = imageY + emptyHeight / 2;
        }
      } else if (ratio < 1) {
        imageHeight = barHeight;
        imageWidth = barHeight * ratio;
      }

      const divContainer = document.createElement('div');
      divContainer.setAttribute(
        'style',
        `
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        overflow: hidden;
        `
      );

      const imgContainer = document.createElement('div');
      imgContainer.setAttribute(
        'style',
        `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: ${AVAILABLE_AREA};
        width: ${availableSpaceForXAxisLabels}px;
        height: ${availableSpaceForXAxisLabels}px;
        min-height: ${availableSpaceForXAxisLabels}px;
      `
      );

      const imgElement = document.createElement('img');
      imgElement.src = dataImages[index];
      imgElement.setAttribute(
        'style',
        `height:${imageHeight}px; width:${imageWidth}px;`
      );

      imgContainer.appendChild(imgElement);

      const availableAreaElement = document.createElement('div');
      availableAreaElement.setAttribute(
        'style',
        `
        width: ${availableSpaceForXAxisLabels}px;
        min-height: ${availableSpaceForXAxisLabels}px;
        background-color: grey;
        z-index: -1;
        `
      );

      const labelElement = document.createElement('label');
      labelElement.textContent = dataLabels[index];
      labelElement.setAttribute('id', 'xAxis-label');
      labelElement.setAttribute('style', labelStyles);

      divContainer.appendChild(imgContainer);
      divContainer.appendChild(labelElement);

      xAxisContainer.appendChild(divContainer);

      shouldDrawImages = false;
    });
  }
};

inputWidth.addEventListener('change', function (ev) {
  graphWidth = +this.value;

  chartContainer.setAttribute(
    'style',
    `
    ${chartContainerStyle};
    width: ${graphWidth}%;
  `
  );
});

const drawLegend = () => {
  legendContainer.setAttribute(
    'style',
    `height:${yAxisHeight}px; width: ${legendWidth}%; ${legendStyle}`
  );
  barColors.forEach((barColor, i) => {
    const colorElementContainer = document.createElement('div');
    colorElementContainer.setAttribute(
      'style',
      `display: flex; flex-direction: row; justify-content: flex-start;`
    );
    const colorElement = document.createElement('div');
    colorElement.setAttribute(
      'style',
      `background-color: ${barColor}; min-width: 30px; height: 20px; display: block; margin-left: 20px;`
    );
    const legentLabelElement = document.createElement('div');
    legentLabelElement.setAttribute('style', 'overflow: hidden;');
    legentLabelElement.textContent = dataLabels[i];

    colorElementContainer.appendChild(colorElement);
    colorElementContainer.appendChild(legentLabelElement);
    legendContainer.appendChild(colorElementContainer);
  });
};

init();
