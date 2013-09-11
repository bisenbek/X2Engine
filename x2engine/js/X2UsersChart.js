/*****************************************************************************************
 * X2CRM Open Source Edition is a customer relationship management program developed by
 * X2Engine, Inc. Copyright (C) 2011-2013 X2Engine Inc.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by the
 * Free Software Foundation with the addition of the following permission added
 * to Section 15 as permitted in Section 7(a): FOR ANY PART OF THE COVERED WORK
 * IN WHICH THE COPYRIGHT IS OWNED BY X2ENGINE, X2ENGINE DISCLAIMS THE WARRANTY
 * OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with
 * this program; if not, see http://www.gnu.org/licenses or write to the Free
 * Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301 USA.
 * 
 * You can contact X2Engine, Inc. P.O. Box 66752, Scotts Valley,
 * California 95067, USA. or at email address contact@x2engine.com.
 * 
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 * 
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "Powered by
 * X2Engine" logo. If the display of the logo is not reasonably feasible for
 * technical reasons, the Appropriate Legal Notices must display the words
 * "Powered by X2Engine".
 *****************************************************************************************/

/*
Child prototype of X2Chart
*/


function X2UsersChart (argsDict) {
	X2Chart.call (this, argsDict);	

	var thisX2Chart = this;

	this.eventTypes = argsDict['eventTypes'];
	this.socialSubtypes = argsDict['socialSubtypes'];
	this.visibilityTypes = argsDict['visibilityTypes'];
	this.DEBUG = argsDict['DEBUG'];

	// color palette used for lines of feed chart
	this.colors;

	this.metricOptionsColors = {}; // used to pair colors with metrics
	//thisX2Chart.resetMetricOptionColors ();

	this.cookieTypes = [
		'startDate', 'endDate', 'binSize', 'firstMetric', 'chartSetting', 
		'eventsFilter', 'socialSubtypesFilter', 'visibilityFilter', 'dateRange'];
	this.filterTypes = ['eventsFilter', 'socialSubtypesFilter', 'visibilityFilter'];

	this.filters = {};

	/*if ($.cookie (thisX2Chart.cookiePrefix + 'chartIsShown') === 'true') {
		$('#' + this.chartType + '-chart-container').show ();
		$('#' + this.chartType + '-show-chart').hide ();
		$('#' + this.chartType + '-hide-chart').show ();
	}*/

	thisX2Chart.setUpFilters ();

	thisX2Chart.start ();

}

/************************************************************************************
Static Methods
************************************************************************************/


/************************************************************************************
Instance Methods
************************************************************************************/

X2UsersChart.prototype = Object.create (X2Chart.prototype);

X2UsersChart.prototype.postSetSettingsFromCookie = function (userCount) {
	var thisX2Chart = this;

    var selectedMetrics = $('#' + thisX2Chart.chartType + '-first-metric').val ();
    if (selectedMetrics === null) return;

	// color palette used for lines of feed chart
	this.colors = thisX2Chart.getColorPalette ($(selectedMetrics).length);
	thisX2Chart.resetMetricOptionColors ();

};

X2UsersChart.prototype.getColorPalette = function (userCount) {
	var thisX2Chart = this;

	function leftPadZeros (str) {
		var length = str.length;
		for (var i = 0; i < 6 - length; ++i) str = '0' + str;
		return str;
	}

	//var userCount = thisX2Chart.getMetricTypes ().length;
	var minColor = 0 + 4194304;
	var maxColor = 16777216 - 4194304;
	var colorInterval = Math.floor ((maxColor - minColor) / userCount);
	var colors = [];
	var currColor = minColor;
    var hexCode, hexRed, hexGreen, hexBlue, modColor, colorSum, colorOffset;
	while (currColor < maxColor) {
		thisX2Chart.DEBUG && console.log ('currColor = ' + currColor);
        hexCode = leftPadZeros (currColor.toString (16));

		thisX2Chart.DEBUG && console.log ('hexCode = ' + hexCode);
        hexRed = parseInt (hexCode.slice (0, 2), 16);
        hexGreen = parseInt (hexCode.slice (2, 4), 16);
        hexBlue = parseInt (hexCode.slice (4, 6), 16);
        thisX2Chart.DEBUG && console.log (hexRed, hexGreen, hexBlue);

        /*// brighten overly dark colors
        colorSum = hexBlue + hexRed + hexGreen;
        if (colorSum < 300) {
            colorOffset = Math.floor ((300 - colorSum) / 3);
            hexBlue += colorOffset;
            hexRed += colorOffset;
            hexGreen += colorOffset;
            hexBlue = hexBlue > 255 ? 255 : hexBlue;
            hexGreen = hexGreen > 255 ? 255 : hexGreen;
            hexBlue = hexRed > 255 ? 255 : hexRed;
        }

        // darken overly bright colors
        if (colorSum > 620) {
            colorOffset = Math.floor ((colorSum - 620) / 3);
            hexBlue -= colorOffset;
            hexRed -= colorOffset;
            hexGreen -= colorOffset;
            hexBlue = hexBlue < 0 ? 0 : hexBlue;
            hexGreen = hexGreen < 0 ? 0 : hexGreen;
            hexBlue = hexRed < 0 ? 0 : hexRed;
        }
        thisX2Chart.DEBUG && console.log (hexRed, hexGreen, hexBlue);
        */

        // make muddy colors less muddy
        if (Math.abs (hexRed - 128) < 40 &&
            Math.abs (hexGreen - 128) < 40) {
            hexRed -= 40;
        } else if (Math.abs (hexGreen - 128) < 40 &&
            Math.abs (hexBlue - 128) < 40) {
            hexGreen -= 40;
        } else if (Math.abs (hexBlue - 128) < 40 &&
            Math.abs (hexRed - 128) < 40) {
            hexBlue -= 40;
        }


        var modColor = hexRed * Math.pow (16, 4) + hexGreen * 
            Math.pow (16, 2) + hexBlue;
        hexCode = leftPadZeros (modColor.toString (16));
		colors.push ('#' + hexCode);
		currColor += colorInterval;
	}

    // sort light to dark
    function colorCompare (colorA, colorB) {
        // remove '#' symbols
        colorA = colorA.slice (1);
        colorB = colorB.slice (1);
        var colorSumA, colorSumB;
        colorSumA = parseInt (colorA.slice (0, 2), 16) +
            parseInt (colorA.slice (2, 4), 16)
            parseInt (colorA.slice (4, 6), 16);
        colorSumB = parseInt (colorB.slice (0, 2), 16) +
            parseInt (colorB.slice (2, 4), 16)
            parseInt (colorB.slice (4, 6), 16);
        return colorSumA < colorSumB;
    }

    colors.sort (colorCompare);

    return colors;
};

X2UsersChart.prototype.setDefaultSettings = function () {
	var thisX2Chart = this;

	thisX2Chart.DEBUG && console.log ('setDefaultSettings: ' + this.chartType);

	// start date picker default
	if (($.cookie (thisX2Chart.cookiePrefix + 'dateRange') === null || 
	     $.cookie (thisX2Chart.cookiePrefix + 'dateRange') !== 'Custom') &&
	    $.cookie (thisX2Chart.cookiePrefix + 'startDate') === null) {

		// default start date 
		$('#' + thisX2Chart.chartType + '-chart-datepicker-from').
			datepicker('setDate', '-7d'); 
		$.cookie (
			thisX2Chart.cookiePrefix + 'startDate', 
			$('#' + thisX2Chart.chartType + '-chart-datepicker-from').
			datepicker ('getDate').valueOf ());
	}

	// end date picker default
	if (($.cookie (thisX2Chart.cookiePrefix + 'dateRange') === null || 
	     $.cookie (thisX2Chart.cookiePrefix + 'dateRange') !== 'Custom') &&
		$.cookie (thisX2Chart.cookiePrefix + 'endDate') === null) {
		thisX2Chart.DEBUG && console.log ('setting default for eventsChart to date');

		// default start date 
		$('#' + thisX2Chart.chartType + '-chart-datepicker-to').
			datepicker('setDate', new Date ()); // default end date
		$.cookie (
			thisX2Chart.cookiePrefix + 'endDate', 
			$('#' + thisX2Chart.chartType + '-chart-datepicker-to').
			datepicker ('getDate').valueOf ());
	}

};

X2UsersChart.prototype.preJqplotPlotPieData = function (chartData) {
	var thisX2Chart = this;

    //thisX2Chart.DEBUG && console.log ('preJqplotPlotPieData: ' + chartData.length);

	thisX2Chart.colors = thisX2Chart.getColorPalette (
	    chartData.length);
    thisX2Chart.resetMetricOptionColors ();
};

X2UsersChart.prototype.preJqplotPlotLineData = function (chartData) {
	var thisX2Chart = this;

    if (chartData === null) return;

    thisX2Chart.preJqplotPlotPieData (chartData);

};

X2UsersChart.prototype.chartDataFilter = function (dataPoint, type) {
	var thisX2Chart = this;

	if ((!(type === 'anyone' || type === '') && dataPoint['user'] !== type) ||
		(type === '' && dataPoint['user'] !== null) ||
		($.inArray (dataPoint['type'], thisX2Chart.filters['eventsFilter']) !== -1 &&
		 $.inArray ('all', thisX2Chart.filters['eventsFilter']) !== -1) ||
		($.inArray (dataPoint['subtype'], 
			thisX2Chart.filters['socialSubtypesFilter']) !== -1) ||
		($.inArray (dataPoint['visibility'], 
			thisX2Chart.filters['visibilityFilter']) !== -1)) {
		return true;
	} else {
		return false;
	}
};

X2UsersChart.prototype.resetMetricOptionColors = function () {
	var thisX2Chart = this;
	thisX2Chart.metricOptionsColors = {}; 
	$('#' + thisX2Chart.chartType + '-first-metric').find ('option').each (
		function (index) {

		var colorIndex = index % thisX2Chart.colors.length;
		thisX2Chart.metricOptionsColors[$(this).val ()] = 
			thisX2Chart.colors[colorIndex];
	});
};

X2UsersChart.prototype.selectMetricOptionColorsForSelected = function (firstMetricVal) {
	var thisX2Chart = this;
	thisX2Chart.metricOptionsColors = {}; 
	for (var i in firstMetricVal) {
		var colorIndex = i % thisX2Chart.colors.length;
		thisX2Chart.metricOptionsColors[firstMetricVal[i]] = 
			thisX2Chart.colors[colorIndex];
	}
};

X2UsersChart.prototype.postMetricSelectionSetup = function () {
	var thisX2Chart = this;

	$('#' + thisX2Chart.chartType + '-first-metric').bind ("multiselect2beforeclose", 
		function (evt, ui) {
			var firstMetricVal = $(this).val ();
			var maxSelected = 21;
			if (firstMetricVal !== null) {
				thisX2Chart.applyMultiselectSettings (
					$(this), firstMetricVal.slice (0, maxSelected));
				/*if (firstMetricVal.length > maxSelected) {
					thisX2Chart.selectMetricOptionColorsForSelected (firstMetricVal);
				} else {
					thisX2Chart.resetMetricOptionColors ();
				}*/
			}
			thisX2Chart.DEBUG && console.log (
				'postMetricSelectionSetup: metric1.val = ' + firstMetricVal);
		});
};

X2UsersChart.prototype.postPieChartTearDown = function (uiSetUp) {
	var thisX2Chart = this;
	$('#' + thisX2Chart.chartType + '-chart').removeClass ('pie');
	$('#' + thisX2Chart.chartType + '-chart-legend').removeClass ('pie');
	$('#' + thisX2Chart.chartType + '-datepicker-row').removeClass ('pie');
	$('#' + thisX2Chart.chartType + '-top-button-row').removeClass ('feed-pie');
	$('#' + thisX2Chart.chartType + '-create-setting-button').removeClass ('pie');
	$('#' + thisX2Chart.chartType + '-predefined-settings').removeClass ('pie');
	$('#' + thisX2Chart.chartType + '-first-metric-container').show ();
	$('#' + thisX2Chart.chartType + '-bin-size-button-set').show ();
	var filterToggleContainer = $('#' + thisX2Chart.chartType + '-filter-toggle-container').remove ();
	$('#' + thisX2Chart.chartType + '-first-metric-container').after (filterToggleContainer);
	if (uiSetUp) {
		thisX2Chart.DEBUG && console.log ('setting up filters');
		//thisX2Chart.setUpFilters ();
	}
    thisX2Chart.bindFilterEvents ();
};

X2UsersChart.prototype.postPieChartSetUp = function (uiSetUp) {
	var thisX2Chart = this;
	$('#' + thisX2Chart.chartType + '-chart').addClass ('pie');
	$('#' + thisX2Chart.chartType + '-chart-legend').addClass ('pie');
	$('#' + thisX2Chart.chartType + '-datepicker-row').addClass ('pie');
	$('#' + thisX2Chart.chartType + '-top-button-row').addClass ('feed-pie');
	$('#' + thisX2Chart.chartType + '-create-setting-button').addClass ('pie');
	$('#' + thisX2Chart.chartType + '-predefined-settings').addClass ('pie');
	$('#' + thisX2Chart.chartType + '-first-metric-container').hide ();
	$('#' + thisX2Chart.chartType + '-bin-size-button-set').hide ();
	var filterToggleContainer = $('#' + thisX2Chart.chartType + '-filter-toggle-container').remove ();
	$('#' + thisX2Chart.chartType + '-datepicker-row').append (filterToggleContainer);
	if (uiSetUp) {
		thisX2Chart.DEBUG && console.log ('setting up filters');
		//thisX2Chart.setUpFilters ();
	}
    thisX2Chart.bindFilterEvents ();
};



