const NATSPublisher = require('../services/publish.service');
const AuthService = require('../services/auth.service');

const publisher = new NATSPublisher();

(async () => {
  await publisher.connect();
})();

class ChartController {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async validateChartRequest() {
    try {
      if (Boolean(this.req.body.questionnaire_id) &&
          (Object.prototype.hasOwnProperty.call(this.req.body, 'question_id'))) {
        if ((typeof this.req.body.questionnaire_id === 'string') && (typeof this.req.body.question_id === 'number')) {
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async readChart() {
    try {
      const tokenDecoded = await AuthService.tokenValidator(this.req);
      if (!(tokenDecoded.success)) {
        return this.res.status(403).json(tokenDecoded);
      }
      const isInputValid = await this.validateChartRequest();
      if (!(isInputValid)) {
        return this.res.status(400).json({ success: false, message: 'Missing fields detected'});
      }
      const data = await publisher.request('chartCall', this.req.body);
      if (!(data.success)) {
        return this.res.status(404).json({ success: false, message: 'Chart not found' });
      }
      this.res.status(200).setHeader('Content-Type', 'image/svg+xml');
      this.res.sendFile(data.directory);
      return this.res;
    } catch (error) {
      return this.res.status(500).json({
        success: false,
        message: error.name,
        detail: error.message,
      });
    }
  }
}

module.exports = ChartController;
