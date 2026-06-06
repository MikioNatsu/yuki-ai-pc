function summarizeFacts(messages = [], maxFacts = 12) {
  const facts = [];
  for (const message of messages) {
    const text = String(message.content || message.text || "").trim();
    const match = text.match(/\b(?:my name is|i am|mening ismim|ismim)\s+([A-Za-zА-Яа-яЁё'’-]{2,40})/i);
    if (match) facts.push(`user_name=${match[1]}`);
  }
  return [...new Set(facts)].slice(0, maxFacts);
}

module.exports = { summarizeFacts };
