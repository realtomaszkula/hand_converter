import { HandConverterPage } from './app.po';

describe('hand-converter App', function() {
  let page: HandConverterPage;

  beforeEach(() => {
    page = new HandConverterPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
