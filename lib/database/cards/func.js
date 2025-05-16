/** @format */

// Import all tier files dynamically
const fs = require('fs');
const path = require('path');

// Get all tier files from the current directory
const tierFiles = fs
	.readdirSync(__dirname)
	.filter(file => file.startsWith('tier') && file.endsWith('.js'));

// Load all tier data
const allTiers = {};
tierFiles.forEach(file => {
	const tierName = path.basename(file, '.js');
	allTiers[tierName] = require(`./${file}`);
});

/**
 * Universal function to get card details by index
 * @param {string} index - The index of the card (e.g., "NK014" or just "14")
 * @returns {object|null} - The card object or null if not found
 */
async function getCardDetailByIndex(index) {
	// Normalize the index to handle different formats
	let normalizedIndex = index;

	// If the index is just a number, add the "NK" prefix and pad to 3 digits
	if (!isNaN(index) && !index.startsWith('NK')) {
		normalizedIndex = `NK${index.toString().padStart(3, '0')}`;
	}

	// Combine all tier arrays into one for searching
	const allCards = Object.values(allTiers).flat();

	// Find the card with matching index
	const card = allCards.find(card => card.index === normalizedIndex);

	return card || null;
}

// Example usage:
async function example() {
	try {
		// Get card with index NK095
		const card = await getCardDetailByIndex('95');
		if (card) {
			console.log(`Found card: ${card.title} (${card.index})`);
			console.log(`Price: ${card.price}`);
			console.log(`Tier: ${card.tier}`);
			console.log(`URL: ${card.detailUrl}`);
		} else {
			console.log('Card not found');
		}
	} catch (error) {
		console.error('Error fetching card:', error);
	}
}

// Run the example
example();

module.exports = { getCardDetailByIndex };
