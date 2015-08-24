describe('rangeSlider directive', function () {
    'use strict';

    var createElement, element, scope, isolateScope, rangeLimits;
    var margins = {
        left: 25,
        right: 10
    };

    var flushAllD3Transitions = function () {
        var now = Date.now;
        Date.now = function () {
            return Infinity;
        };
        d3.timer.flush();
        Date.now = now;
    };

    beforeEach(module('talend.widget'));

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new(true);
        scope.rangeLimits = {
            min: 0,
            max: 20,
            minBrush: 5,
            maxBrush: 15
        };
        scope.brushEnd = jasmine.createSpy('spy');

        createElement = function () {
            element = angular.element('<range-slider id="barChart"' +
                'id="domId"' +
                'width="250"' +
                'height="100"' +
                'range-limits = "rangeLimits"' +
                'on-brush-end = "brushEnd"' +
                '></range-slider>');

            angular.element('body').append(element);
            $compile(element)(scope);
            scope.$digest();

            isolateScope = element.isolateScope();
        };
    }));

    beforeEach(function () {
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();

        scope.$destroy();
        element.remove();
    });

    it('should calculate the right positions of the brush handlers compared to the rangeSlider limits when there is NO brush', function () {
        //given
        scope.rangeLimits = {
            min: 0,
            max: 20,
            minBrush: undefined,
            maxBrush: undefined
        };

        //when
        createElement();
        jasmine.clock().tick(100);
        flushAllD3Transitions();

        //then: brush extent width should be all the range size
        var x = d3.scale.linear()
            .domain([scope.rangeLimits.min, scope.rangeLimits.max])
            .range([0, (250 - (margins.left + margins.right))]);
        expect(d3.select('.extent').attr('width')).toBe('' + (x(scope.rangeLimits.max) - x(scope.rangeLimits.min)));
        expect(d3.select('.extent').attr('x')).toBe('' + x(scope.rangeLimits.min));
    });

    it('should calculate the right positions of the brush handlers compared to the rangeSlider limits when there is a brush', function () {
        //when
        createElement();
        jasmine.clock().tick(100);
        flushAllD3Transitions();

        //then : brush extent width should be between [5...15]
        var x = d3.scale.linear()
            .domain([scope.rangeLimits.min, scope.rangeLimits.max])
            .range([0, (250 - (margins.left + margins.right))]);

        expect(d3.select('.extent').attr('width')).toBe('' + (x(scope.rangeLimits.maxBrush) - x(scope.rangeLimits.minBrush)));
        expect(d3.select('.extent').attr('x')).toBe('' + x(scope.rangeLimits.minBrush));

        var brush = d3.svg.brush()
            .x(x)
            .extent([6, 10]);
        d3.select('.brush').call(brush.event)
            .call(brush.extent([0, 20]));
        expect(d3.select('.extent').attr('width')).toBe('' + (x(scope.rangeLimits.max) - x(scope.rangeLimits.min)));
    });

    it('should make a brush action programmatically', function () {
        //given
        createElement();
        jasmine.clock().tick(100);
        flushAllD3Transitions();

        //when : set the brush extent to [0, 20]
        var x = d3.scale.linear()
            .domain([scope.rangeLimits.min, scope.rangeLimits.max])
            .range([0, (250 - (margins.left + margins.right))]);

        d3.select('.brush').call(isolateScope.brush.event)
            .call(isolateScope.brush.extent([0, 20]))
            .call(isolateScope.brush.event);

        //then
        expect(d3.select('.extent').attr('width')).toBe('' + (x(scope.rangeLimits.max) - x(scope.rangeLimits.min)));
        expect(document.getElementsByName('minRange')[0].value).toBe('0');
        expect(document.getElementsByName('maxRange')[0].value).toBe('20');
    });

    it('should set the new typed range manually and submit with Enter', function () {
        //given
        createElement();
        jasmine.clock().tick(100);

        element.find('input').eq(1)[0].value = 10;
        element.find('input').eq(0)[0].value = 8;

        //when
        var event2 = new angular.element.Event('keyup');
        event2.keyCode = 13;
        element.find('input').eq(0).trigger(event2);

        //then
        expect(isolateScope.brush.extent()).toEqual([8, 10]);
    });

    it('should set the new typed range manually and submit with Blur', function () {
        //given
        createElement();
        jasmine.clock().tick(100);

        //when
        element.find('input').eq(0)[0].value = 7;
        var event2 = new angular.element.Event('blur');
        element.find('input').eq(0).trigger(event2);

        //then
        expect(isolateScope.brush.extent()).toEqual([7, 15]);
    });

    it('should cancel the new typed range manually and submit with Esc', function () {
        //given
        createElement();
        jasmine.clock().tick(100);

        element.find('input').eq(0)[0].value = 7;

        //when
        var event2 = new angular.element.Event('keyup');
        event2.keyCode = 27;
        element.find('input').eq(0).trigger(event2);

        //then
        expect(isolateScope.brush.extent()).toEqual([5, 15]);
        expect(element.find('input').eq(0)[0].value).toBe('5');
    });

    it('should cancel the new incorrect typed range and gets back to the initial value after Enter Hit and hide the error message', function () {
        //given
        createElement();
        jasmine.clock().tick(100);

        element.find('input').eq(0)[0].value = 'kjhfkjfkl';

        //when
        var event2 = new angular.element.Event('keyup');
        event2.keyCode = 13;
        element.find('input').eq(0).trigger(event2);

        //then
        expect(isolateScope.brush.extent()).toEqual([5, 15]);
        expect(element.find('text.invalid-value-msg').eq(0).text()).toBe('');
    });

    it('should show error message', function () {
        //given
        createElement();
        jasmine.clock().tick(100);

        element.find('input').eq(0)[0].value = 'kjhfkjfkl';

        //when
        var event2 = new angular.element.Event('keyup');
        event2.keyCode = 104;//8
        element.find('input').eq(0).trigger(event2);

        //then
        expect(isolateScope.brush.extent()).toEqual([5, 15]);
        expect(element.find('text.invalid-value-msg').eq(0).text()).toBe('Invalid Entered Value');
    });

    it('should check if the filter was propagated to the StatsDetailsCtrl controller', function () {
        //given
        createElement();
        jasmine.clock().tick(100);

        element.find('input').eq(0)[0].value = 7;

        //when
        var event2 = new angular.element.Event('blur');
        event2.keyCode = 13;
        element.find('input').eq(0).trigger(event2);

        //then
        expect(scope.brushEnd).toHaveBeenCalledWith([7, 15]);
    });
});
