// Copyright (c) 2025, Hopnet Communications LLP and contributors
// For license information, please see license.txt

frappe.ui.form.on("Farmer Profile", {
	refresh(frm) {
		// Set up filter for grid view
		frm.set_query("cattle_breed", "cattle_details", function(doc, cdt, cdn) {
			let row = locals[cdt][cdn];
			return {
				filters: {
					'cattle_type': row.cattle_type
				}
			};
		});
	},
});

frappe.ui.form.on("Farmer Cattle Detail", {
	before_cattle_details_add: function(frm, cdt, cdn) {
		frm.script_manager.copy_from_first_row("cattle_details", frm.doc.cattle_details);
	},

	cattle_details_add: function(frm, cdt, cdn) {
		setup_cattle_breed_filter(frm, cdt, cdn);
		// Set default values for new row
		set_default_values(frm, cdt, cdn);
	},

	cattle_type: function(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		if (row.cattle_type) {
			frappe.model.set_value(cdt, cdn, 'cattle_breed', '');
			setup_cattle_breed_filter(frm, cdt, cdn);
		} else {
			// Reset all fields in the row when cattle_type is removed
			reset_row_fields(frm, cdt, cdn);
		}
	},

	age: function(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		if (row.age) {
			const currentYear = new Date().getFullYear();
			const birthYear = Math.floor(currentYear - row.age);
			frappe.model.set_value(cdt, cdn, 'birth_year', birthYear)
				.then(() => {
					frm.refresh_field('cattle_details');
				});
		} else {
			frappe.model.set_value(cdt, cdn, 'birth_year', 0)
				.then(() => {
					frm.refresh_field('cattle_details');
				});
		}
	},

	male_offspring_count: function(frm, cdt, cdn) {
		calculate_total_offspring(frm, cdt, cdn);
	},

	female_offspring_count: function(frm, cdt, cdn) {
		calculate_total_offspring(frm, cdt, cdn);
	}
});

function setup_cattle_breed_filter(frm, cdt, cdn) {
	let row = locals[cdt][cdn];
	
	// Set up filter for expanded form view
	if (frm.fields_dict.cattle_details.grid.grid_rows_by_docname[cdn]?.grid_form) {
		frm.fields_dict.cattle_details.grid.grid_rows_by_docname[cdn].grid_form.fields_dict.cattle_breed.get_query = function() {
			return {
				filters: {
					'cattle_type': row.cattle_type
				}
			};
		};
	}
	
	// Refresh the grid to ensure filters are applied
	frm.refresh_field('cattle_details');
}

function set_default_values(frm, cdt, cdn) {
	frappe.model.set_value(cdt, cdn, 'age', 0);
	frappe.model.set_value(cdt, cdn, 'birth_year', 0);
	frappe.model.set_value(cdt, cdn, 'male_offspring_count', 0);
	frappe.model.set_value(cdt, cdn, 'female_offspring_count', 0);
	frappe.model.set_value(cdt, cdn, 'total_offspring_count', 0);
}

function reset_row_fields(frm, cdt, cdn) {
	// Reset all fields to their default values
	frappe.model.set_value(cdt, cdn, 'cattle_breed', '');
	frappe.model.set_value(cdt, cdn, 'cattle_name', '');
	frappe.model.set_value(cdt, cdn, 'age', 0);
	frappe.model.set_value(cdt, cdn, 'birth_year', 0);
	frappe.model.set_value(cdt, cdn, 'male_offspring_count', 0);
	frappe.model.set_value(cdt, cdn, 'female_offspring_count', 0);
	frappe.model.set_value(cdt, cdn, 'total_offspring_count', 0);
	
	// Refresh the grid
	frm.refresh_field('cattle_details');
}

function calculate_total_offspring(frm, cdt, cdn) {
	let row = locals[cdt][cdn];
	
	// Ensure we're working with numbers and default to 0 if undefined
	const maleCount = parseInt(row.male_offspring_count) || 0;
	const femaleCount = parseInt(row.female_offspring_count) || 0;
	
	// Calculate total
	const total = maleCount + femaleCount;
	
	// Set the total value
	frappe.model.set_value(cdt, cdn, 'total_offspring_count', total)
		.then(() => {
			frm.refresh_field('cattle_details');
		});
}
