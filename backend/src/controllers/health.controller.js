const healthController = (_req, res) => {
  res.status(200).json({ status: 'ok' });
};

export { healthController };
