# SlideParser Meteor package
Parse Slide Markdown to an AST

# Usage
just add the package to the smart.json and you are ready to go

	{
		"packages": {
			"slideParser": {
				"git": "git@bitbucket.org:liquidlearningdev/slideparser.git"
			}
		}
	}

# Tests
Tests are done with mocha/chai.

Init the test environment with `npm install` and test the sources with `make test`.


# protocoll
22.01.2014

Ich habe den AST der S(G) Grammatik modelliergun und nciht der G grammatik, welchen ich ursprünglich wollte. eine optionsmenge und eine Option ist somit nur ein attribut eines normalen knotens, nicht teil der ableitung
=> nodes für optioksknoten müssen nicht erstellt werden, sowie votes und delegationen in der eigendlichen ableitung unsichtbar gemacht werden da es nur attribute sind.
